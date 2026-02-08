import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationChannel } from '@prisma/client';
import { NotificationEventsService } from './notification-events.service';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import nodemailer from 'nodemailer';

type JsonObject = Record<string, unknown>;

@Injectable()
export class NotificationsWorker {
  private readonly logger = new Logger(NotificationsWorker.name);

  // V1 safety knobs
  private readonly batchSize = 10;
  private readonly maxAttempts = 3;

  constructor(
    private readonly events: NotificationEventsService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron('*/5 * * * * *') // every 5 seconds
  async processOutbox() {
    const pending = await this.events.findPendingBatch(this.batchSize);
    if (pending.length === 0) return;

    for (const event of pending) {
      // Hard stop on attempts (avoid infinite loops)
      if (event.attempts >= this.maxAttempts) {
        await this.events.markFailed(event.id, 'Max attempts reached.');
        continue;
      }

      // Optimistic claim (prevents double processing across instances)
      const claimed = await this.events.claimIfPending(
        event.id,
        event.attempts,
      );
      if (!claimed) continue;

      try {
        const payload = this.safeJson(event.payloadJson);
        const channel = String(event.channel);

        // Deliver based on channel
        if (event.channel === NotificationChannel.EMAIL) {
          await this.deliverEmail({
            notificationId: event.id,
            type: event.type,
            recipientUserId: event.recipientUserId,
            payload,
          });
        } else {
          // V1: only EMAIL is implemented; others fallback to log-only
          const entityType = event.entityType ?? 'unknown';
          const entityId = event.entityId ?? 'unknown';
          this.logger.log(
            `DELIVER (noop) notification id=${event.id} type=${event.type} channel=${channel} recipient=${event.recipientUserId} entity=${entityType}:${entityId}`,
          );
        }

        await this.events.markSent(event.id);
      } catch (err: unknown) {
        const msg = this.errMessage(err);
        await this.events.setLastError(event.id, msg);

        // After claim, attempts already incremented.
        // If now reached maxAttempts, mark FAILED; else keep PENDING for retry.
        const updatedAttempts = event.attempts + 1;
        if (updatedAttempts >= this.maxAttempts) {
          await this.events.markFailed(event.id, msg);
        }
      }
    }
  }

  private async deliverEmail(input: {
    notificationId: string;
    type: string;
    recipientUserId: string;
    payload: JsonObject;
  }) {
    // Resolve recipient email: prefer payload.email (OTP uses it), else lookup by recipientUserId
    const payloadEmail = this.getNested(input.payload, 'email');
    const to =
      typeof payloadEmail === 'string' && payloadEmail.trim()
        ? payloadEmail.trim().toLowerCase()
        : await this.lookupUserEmail(input.recipientUserId);

    if (!to) {
      // No recipient email → fail (this is actionable)
      throw new Error('Recipient email not found');
    }

    const subject = this.mapSubject(input.type, input.payload);
    const html = this.renderTemplate(
      NotificationChannel.EMAIL,
      input.type,
      input.payload,
    );

    // If SMTP isn't configured, behave safely:
    const smtp = this.smtpConfig();
    if (!smtp.configured) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('SMTP not configured');
      }

      // Dev fallback: log-only
      this.logger.log(
        `EMAIL (dev log-only) id=${input.notificationId} to=${to} subject="${subject}" htmlLen=${html.length}`,
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth:
        smtp.user && smtp.pass
          ? { user: smtp.user, pass: smtp.pass }
          : undefined,
    });

    const from = smtp.from;
    const replyTo = smtp.replyTo;

    await transporter.sendMail({
      from,
      to,
      replyTo,
      subject,
      html,
    });

    this.logger.log(
      `EMAIL sent id=${input.notificationId} to=${to} subject="${subject}"`,
    );
  }

  private async lookupUserEmail(userId: string): Promise<string | null> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    return u?.email?.trim().toLowerCase() ?? null;
  }

  private smtpConfig(): {
    configured: boolean;
    host: string;
    port: number;
    secure: boolean;
    user: string | null;
    pass: string | null;
    from: string;
    replyTo: string | undefined;
  } {
    const host = (process.env.SMTP_HOST || '').trim();
    const portRaw = (process.env.SMTP_PORT || '').trim();
    const port = Number(portRaw || '587');
    const secure = (process.env.SMTP_SECURE || 'false') === 'true';

    const user = (process.env.SMTP_USER || '').trim() || null;
    const pass = (process.env.SMTP_PASS || '').trim() || null;

    // Default sender for real business emails
    const from =
      (process.env.SMTP_FROM || '').trim() ||
      'Laugh & Lodge Vocation Homes Rental LLC <Booking@rentpropertyuae.com>';

    const replyTo = (process.env.SMTP_REPLY_TO || '').trim() || undefined;

    const configured = Boolean(host) && Number.isFinite(port) && port > 0;

    return { configured, host, port, secure, user, pass, from, replyTo };
  }

  private safeJson(s: string): JsonObject {
    try {
      const parsed: unknown = JSON.parse(s || '{}');
      return this.isObject(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  private isObject(v: unknown): v is JsonObject {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
  }

  private errMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'Unknown notification delivery error';
  }

  private mapSubject(type: string, payload: JsonObject): string {
    switch (type) {
      case 'EMAIL_VERIFICATION_OTP':
        return 'Your verification code (OTP)';
      case 'BOOKING_CONFIRMED':
        return 'Booking confirmed';
      case 'BOOKING_CANCELLED':
      case 'BOOKING_CANCELLED_BY_GUEST':
        return 'Booking cancelled';
      case 'OPS_TASKS_CREATED':
        return 'Your stay services are scheduled';
      default: {
        // fallback but professional
        const ref = this.getNested(payload, 'booking.id');
        if (typeof ref === 'string' && ref.trim())
          return `Update for booking ${ref.trim()}`;
        return 'Account update';
      }
    }
  }

  private renderTemplate(
    channel: NotificationChannel,
    type: string,
    payload: JsonObject,
  ): string {
    // Only EMAIL in V1
    if (channel !== NotificationChannel.EMAIL) {
      return JSON.stringify({ type, payload });
    }

    const fileName = this.mapTemplate(type);
    const templatePath = path.join(__dirname, 'templates', fileName);

    // If template missing, fallback to JSON output
    if (!fs.existsSync(templatePath)) {
      return JSON.stringify({ type, payload }, null, 2);
    }

    const html = fs.readFileSync(templatePath, 'utf8');

    // Inject standard brand fields if not present
    const merged: JsonObject = {
      brand: {
        name: 'Laugh & Lodge',
        legalName: 'Laugh & Lodge Vocation Homes Rental LLC',
        domain: 'rentpropertyuae.com',
        supportEmail: 'Info@rentpropertyuae.com',
        bookingEmail: 'Booking@rentpropertyuae.com',
        phone: '+971502348756',
        country: 'United Arab Emirates',
      },
      ...payload,
    };

    return this.simpleInterpolate(html, merged);
  }

  private mapTemplate(type: string) {
    switch (type) {
      case 'EMAIL_VERIFICATION_OTP':
        return 'email-verification-otp.html';
      case 'BOOKING_CONFIRMED':
        return 'booking-confirmed.html';
      case 'BOOKING_CANCELLED':
      case 'BOOKING_CANCELLED_BY_GUEST':
        return 'booking-cancelled.html';
      case 'OPS_TASKS_CREATED':
        return 'ops-tasks-created.html';
      default:
        // fallback to something harmless
        return 'booking-confirmed.html';
    }
  }

  private simpleInterpolate(html: string, payload: JsonObject) {
    // Minimal templating: {{key}} replacements
    return html.replace(
      /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g,
      (_m, key: string) => {
        const value = this.getNested(payload, key);
        if (value === null || value === undefined) return '';
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          typeof value === 'bigint'
        ) {
          return String(value);
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (Array.isArray(value) || this.isObject(value)) {
          try {
            return JSON.stringify(value);
          } catch {
            return '';
          }
        }
        return '';
      },
    );
  }

  private getNested(obj: JsonObject, key: string): unknown {
    return key.split('.').reduce<unknown>((acc, k) => {
      if (!this.isObject(acc)) return undefined;
      return acc[k];
    }, obj);
  }
}
