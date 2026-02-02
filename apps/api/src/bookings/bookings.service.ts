import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  CalendarDayStatus,
  CancellationActor,
  CancellationMode,
  CancellationReason,
  HoldStatus,
  PaymentStatus,
  Prisma,
  RefundReason,
  RefundStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../modules/prisma/prisma.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CancellationPolicyService } from './policies/cancellation.policy';

const PAYMENT_WINDOW_MINUTES = 15;

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cancellationPolicy: CancellationPolicyService,
  ) {}

  // ---------------------------
  // Quote helpers
  // ---------------------------
  private async computeQuote(params: {
    propertyId: string;
    checkIn: Date;
    checkOut: Date;
  }) {
    const property = await this.prisma.property.findUnique({
      where: { id: params.propertyId },
      select: {
        currency: true,
        basePrice: true,
        cleaningFee: true,
      },
    });

    if (!property) throw new NotFoundException('Property not found.');

    const nights =
      (params.checkOut.getTime() - params.checkIn.getTime()) /
      (1000 * 60 * 60 * 24);

    if (nights <= 0) throw new BadRequestException('Invalid date range.');

    const subtotal = nights * property.basePrice;
    const fees = property.cleaningFee ?? 0;

    return {
      currency: property.currency ?? 'PKR',
      total: subtotal + fees,
    };
  }

  // ---------------------------
  // CREATE BOOKING (HARDENED + EXPIRY)
  // ---------------------------
  async createFromHold(args: {
    userId: string;
    userRole: UserRole;
    holdId: string;
    idempotencyKey?: string | null;
  }) {
    if (args.userRole !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Only CUSTOMER users can create bookings.');
    }

    const idempotencyKey = args.idempotencyKey?.trim() || null;
    const now = new Date();

    // 🔁 Fast-path idempotency
    if (idempotencyKey) {
      const existing = await this.prisma.booking.findFirst({
        where: {
          customerId: args.userId,
          idempotencyKey,
        },
      });

      if (existing) {
        return { ok: true, reused: true, booking: existing };
      }
    }

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const hold = await tx.propertyHold.findUnique({
            where: { id: args.holdId },
          });

          if (!hold) throw new NotFoundException('Hold not found.');
          if (hold.createdById !== args.userId)
            throw new ForbiddenException('You do not own this hold.');

          if (hold.status !== HoldStatus.ACTIVE)
            throw new BadRequestException('Hold is not active.');

          if (hold.expiresAt <= now) {
            await tx.propertyHold.update({
              where: { id: hold.id },
              data: { status: HoldStatus.EXPIRED },
            });
            throw new BadRequestException('Hold has expired.');
          }

          // 1️⃣ Booking overlap check
          const bookingOverlap = await tx.booking.findFirst({
            where: {
              propertyId: hold.propertyId,
              status: {
                in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED],
              },
              AND: [
                { checkIn: { lt: hold.checkOut } },
                { checkOut: { gt: hold.checkIn } },
              ],
            },
          });

          if (bookingOverlap)
            throw new BadRequestException('Dates no longer available.');

          // 2️⃣ Hold overlap check
          const holdOverlap = await tx.propertyHold.findFirst({
            where: {
              propertyId: hold.propertyId,
              status: HoldStatus.ACTIVE,
              expiresAt: { gt: now },
              id: { not: hold.id },
              AND: [
                { checkIn: { lt: hold.checkOut } },
                { checkOut: { gt: hold.checkIn } },
              ],
            },
          });

          if (holdOverlap)
            throw new BadRequestException('Dates no longer available.');

          // 3️⃣ Calendar block check
          const blocked = await tx.propertyCalendarDay.findFirst({
            where: {
              propertyId: hold.propertyId,
              status: CalendarDayStatus.BLOCKED,
              date: { gte: hold.checkIn, lt: hold.checkOut },
            },
          });

          if (blocked)
            throw new BadRequestException('Dates include blocked nights.');

          const quote = await this.computeQuote({
            propertyId: hold.propertyId,
            checkIn: hold.checkIn,
            checkOut: hold.checkOut,
          });

          const booking = await tx.booking.create({
            data: {
              customerId: args.userId,
              propertyId: hold.propertyId,
              holdId: hold.id,
              checkIn: hold.checkIn,
              checkOut: hold.checkOut,
              adults: 2,
              children: 0,
              status: BookingStatus.PENDING_PAYMENT,
              totalAmount: quote.total,
              currency: quote.currency,
              idempotencyKey,
              expiresAt: new Date(
                Date.now() + PAYMENT_WINDOW_MINUTES * 60 * 1000,
              ),
            },
          });

          await tx.propertyHold.update({
            where: { id: hold.id },
            data: {
              status: HoldStatus.CONVERTED,
              bookingId: booking.id,
              convertedAt: now,
            },
          });

          return { ok: true, reused: false, booking };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (err) {
      // 🛡️ Race-condition hardening
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002' &&
        idempotencyKey
      ) {
        const existing = await this.prisma.booking.findFirst({
          where: {
            customerId: args.userId,
            idempotencyKey,
          },
        });

        if (existing) {
          return { ok: true, reused: true, booking: existing };
        }
      }

      throw err;
    }
  }

  // ---------------------------
  // CANCEL BOOKING (FP POLICY ENGINE + REFUND STAGING)
  // ---------------------------
  async cancelBooking(args: {
    bookingId: string;
    actorUser: { id: string; role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' };
    dto: CancelBookingDto;
  }) {
    const { bookingId, actorUser, dto } = args;

    const actor: CancellationActor =
      actorUser.role === 'ADMIN'
        ? CancellationActor.ADMIN
        : actorUser.role === 'VENDOR'
          ? CancellationActor.VENDOR
          : CancellationActor.CUSTOMER;

    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          property: true,
          payment: true,
          cancellation: true,
        },
      });

      if (!booking) throw new NotFoundException('Booking not found.');

      // ✅ Idempotent: already cancelled
      if (booking.status === BookingStatus.CANCELLED && booking.cancellation) {
        return {
          ok: true,
          alreadyCancelled: true,
          bookingId: booking.id,
          cancellationId: booking.cancellation.id,
          refundId: booking.cancellation.refundId ?? null,
        };
      }

      if (booking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException('Completed bookings cannot be cancelled.');
      }

      // ✅ Permission enforcement
      if (actor === CancellationActor.CUSTOMER) {
        if (booking.customerId !== actorUser.id) {
          throw new ForbiddenException('You can only cancel your own booking.');
        }
      }

      if (actor === CancellationActor.VENDOR) {
        if (booking.property.vendorId !== actorUser.id) {
          throw new ForbiddenException(
            'You can only cancel bookings for your own property.',
          );
        }

        const allowed = new Set<CancellationReason>([
          CancellationReason.OWNER_REQUEST,
          CancellationReason.FORCE_MAJEURE,
        ]);

        if (!allowed.has(dto.reason)) {
          throw new ForbiddenException(
            'Vendor cancellation reason not allowed.',
          );
        }
      }

      // ✅ Allowed statuses to cancel
      if (
        booking.status !== BookingStatus.PENDING_PAYMENT &&
        booking.status !== BookingStatus.CONFIRMED
      ) {
        throw new BadRequestException(
          `Booking cannot be cancelled from status ${booking.status}.`,
        );
      }

      // ✅ Load policy: property override -> global active
      const policy =
        (await tx.cancellationPolicyConfig.findFirst({
          where: { propertyId: booking.propertyId, isActive: true },
          orderBy: { updatedAt: 'desc' },
        })) ??
        (await tx.cancellationPolicyConfig.findFirst({
          where: { propertyId: null, isActive: true },
          orderBy: { updatedAt: 'desc' },
        }));

      if (!policy) {
        throw new BadRequestException(
          'Cancellation policy is not configured. Create a global CancellationPolicyConfig first.',
        );
      }

      // ✅ Force HARD cancellation for certain reasons
      const forcedHardReasons = new Set<CancellationReason>([
        CancellationReason.FRAUD,
        CancellationReason.ADMIN_OVERRIDE,
      ]);

      const requestedMode =
        forcedHardReasons.has(dto.reason) ? CancellationMode.HARD : dto.mode;

      // ✅ Policy decision
      const decision = this.cancellationPolicy.decide({
        now: new Date(),
        actor,
        booking: {
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
        },
        policy,
        requestedMode,
      });

      // ✅ Refund staging (only if payment exists and is refundable)
      let refundId: string | null = null;

      const canStageRefund =
        decision.refundableAmount > 0 &&
        !!booking.payment &&
        (booking.payment.status === PaymentStatus.AUTHORIZED ||
          booking.payment.status === PaymentStatus.CAPTURED);

      if (canStageRefund) {
        const refund = await tx.refund.create({
          data: {
            bookingId: booking.id,
            paymentId: booking.payment!.id,
            status: RefundStatus.PENDING,
            reason: RefundReason.CANCELLATION,
            amount: decision.refundableAmount,
            currency: booking.currency,
            provider: booking.payment!.provider,
          },
        });

        refundId = refund.id;
      }

      // ✅ Create cancellation snapshot (1:1)
      const cancellation =
        booking.cancellation ??
        (await tx.bookingCancellation.create({
          data: {
            bookingId: booking.id,
            actor,
            reason: dto.reason,
            notes: dto.notes?.trim() || null,
            mode: decision.mode,
            policyVersion: decision.policyVersion,

            totalAmount: booking.totalAmount,
            managementFee: 0,
            penaltyAmount: decision.penaltyAmount,
            refundableAmount: decision.refundableAmount,
            currency: booking.currency,

            releasesInventory: decision.releasesInventory,
            refundId,
          },
        }));

      // ✅ Update booking
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelledBy: actor,
          cancellationReason: dto.reason,
        },
      });

      return {
        ok: true,
        bookingId: booking.id,
        cancellationId: cancellation.id,
        refundId,
        decision: {
          tier: decision.tier,
          mode: decision.mode,
          hoursToCheckIn: decision.hoursToCheckIn,
          penaltyAmount: decision.penaltyAmount,
          refundableAmount: decision.refundableAmount,
          policyVersion: decision.policyVersion,
        },
      };
    });
  }
}
