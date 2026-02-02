import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  PaymentEventType,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  RefundStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ManualPaymentsProvider } from './providers/manual.provider';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly manualProvider: ManualPaymentsProvider,
  ) {}

  async authorize(args: {
    actor: { id: string; role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' };
    bookingId: string;
    provider: PaymentProvider;
    idempotencyKey: string | null;
  }) {
    const provider = args.provider ?? PaymentProvider.MANUAL;
    const idempotencyKey = (args.idempotencyKey ?? '').trim() || null;

    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: args.bookingId },
        include: { payment: true },
      });
      if (!booking) throw new NotFoundException('Booking not found.');

      if (args.actor.role === 'CUSTOMER' && booking.customerId !== args.actor.id) {
        throw new ForbiddenException('You can only pay for your own booking.');
      }

      if (booking.status !== BookingStatus.PENDING_PAYMENT) {
        throw new BadRequestException(
          `Booking is not payable from status ${booking.status}.`,
        );
      }

      const payment =
        booking.payment ??
        (await tx.payment.create({
          data: {
            bookingId: booking.id,
            provider,
            status: PaymentStatus.REQUIRES_ACTION,
            amount: booking.totalAmount,
            currency: booking.currency,
          },
        }));

      if (idempotencyKey) {
        const existingEvent = await tx.paymentEvent.findUnique({
          where: {
            uniq_payment_event_idempotency: {
              paymentId: payment.id,
              type: PaymentEventType.AUTHORIZE,
              idempotencyKey,
            },
          },
        });

        if (existingEvent) {
          const refreshed = await tx.payment.findUnique({ where: { id: payment.id } });
          return { ok: true, reused: true, payment: refreshed };
        }
      }

      // If already authorized/captured: idempotent no-op
      if (payment.status === PaymentStatus.AUTHORIZED || payment.status === PaymentStatus.CAPTURED) {
        await tx.paymentEvent.create({
          data: {
            paymentId: payment.id,
            type: PaymentEventType.AUTHORIZE,
            idempotencyKey,
            providerRef: payment.providerRef ?? null,
          },
        });
        return { ok: true, reused: true, payment };
      }

      let providerRef: string | null = null;

      if (provider === PaymentProvider.MANUAL) {
        const res = await this.manualProvider.authorize({
          bookingId: booking.id,
          amount: payment.amount,
          currency: payment.currency,
        });
        providerRef = res.providerRef;
      } else {
        throw new BadRequestException(`Provider ${provider} not supported in V1.`);
      }

      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.AUTHORIZED, providerRef },
      });

      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          type: PaymentEventType.AUTHORIZE,
          idempotencyKey,
          providerRef,
        },
      });

      return { ok: true, reused: false, payment: updated };
    });
  }

  async capture(args: {
    actor: { id: string; role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' };
    bookingId: string;
    idempotencyKey: string | null;
  }) {
    const idempotencyKey = (args.idempotencyKey ?? '').trim() || null;

    return this.prisma.$transaction(
      async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: args.bookingId },
          include: { payment: true },
        });
        if (!booking) throw new NotFoundException('Booking not found.');
        if (!booking.payment) throw new BadRequestException('No payment exists for booking.');

        if (args.actor.role === 'CUSTOMER' && booking.customerId !== args.actor.id) {
          throw new ForbiddenException('You can only capture payment for your own booking.');
        }

        if (booking.status !== BookingStatus.PENDING_PAYMENT) {
          throw new BadRequestException(`Cannot capture from booking status ${booking.status}.`);
        }

        const payment = booking.payment;

        if (idempotencyKey) {
          const existingEvent = await tx.paymentEvent.findUnique({
            where: {
              uniq_payment_event_idempotency: {
                paymentId: payment.id,
                type: PaymentEventType.CAPTURE,
                idempotencyKey,
              },
            },
          });

          if (existingEvent) {
            const refreshedPayment = await tx.payment.findUnique({ where: { id: payment.id } });
            const refreshedBooking = await tx.booking.findUnique({ where: { id: booking.id } });
            return { ok: true, reused: true, payment: refreshedPayment, booking: refreshedBooking };
          }
        }

        if (payment.status === PaymentStatus.CAPTURED) {
          await tx.paymentEvent.create({
            data: {
              paymentId: payment.id,
              type: PaymentEventType.CAPTURE,
              idempotencyKey,
              providerRef: payment.providerRef ?? null,
            },
          });
          const refreshedBooking = await tx.booking.findUnique({ where: { id: booking.id } });
          return { ok: true, reused: true, payment, booking: refreshedBooking };
        }

        if (payment.status !== PaymentStatus.AUTHORIZED) {
          throw new BadRequestException(`Payment is not capturable from status ${payment.status}.`);
        }

        let providerRef = payment.providerRef ?? null;

        if (payment.provider === PaymentProvider.MANUAL) {
          const res = await this.manualProvider.capture({
            providerRef: payment.providerRef ?? `manual_missing_${payment.id}`,
          });
          providerRef = res.providerRef;
        } else {
          throw new BadRequestException(`Provider ${payment.provider} not supported in V1.`);
        }

        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.CAPTURED, providerRef },
        });

        const updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CONFIRMED },
        });

        await tx.paymentEvent.create({
          data: {
            paymentId: payment.id,
            type: PaymentEventType.CAPTURE,
            idempotencyKey,
            providerRef,
          },
        });

        return { ok: true, reused: false, payment: updatedPayment, booking: updatedBooking };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async processRefund(args: {
    actor: { id: string; role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' };
    refundId: string;
    idempotencyKey: string | null;
    amountOverride?: number;
  }) {
    const idempotencyKey = (args.idempotencyKey ?? '').trim() || null;

    return this.prisma.$transaction(async (tx) => {
      const refund = await tx.refund.findUnique({
        where: { id: args.refundId },
        include: { payment: true },
      });
      if (!refund) throw new NotFoundException('Refund not found.');
      if (!refund.payment) throw new BadRequestException('Refund has no payment attached.');

      // V1: ADMIN-only refund execution (later: webhook/worker)
      if (args.actor.role !== 'ADMIN') {
        throw new ForbiddenException('Only ADMIN can process refunds in V1.');
      }

      if (refund.status === RefundStatus.SUCCEEDED) {
        return { ok: true, reused: true, refund };
      }

      if (refund.status !== RefundStatus.PENDING && refund.status !== RefundStatus.PROCESSING) {
        throw new BadRequestException(`Refund cannot be processed from status ${refund.status}.`);
      }

      const payment = refund.payment;

      if (idempotencyKey) {
        const existingEvent = await tx.paymentEvent.findUnique({
          where: {
            uniq_payment_event_idempotency: {
              paymentId: payment.id,
              type: PaymentEventType.REFUND,
              idempotencyKey,
            },
          },
        });

        if (existingEvent) {
          const refreshedRefund = await tx.refund.findUnique({ where: { id: refund.id } });
          return { ok: true, reused: true, refund: refreshedRefund };
        }
      }

      const amount =
        typeof args.amountOverride === 'number' && args.amountOverride > 0
          ? args.amountOverride
          : refund.amount;

      await tx.refund.update({
        where: { id: refund.id },
        data: { status: RefundStatus.PROCESSING },
      });

      let providerRefundRef: string | null = null;

      if (refund.provider === PaymentProvider.MANUAL) {
        const res = await this.manualProvider.refund({
          providerRef: payment.providerRef ?? null,
          refundId: refund.id,
          amount,
          currency: refund.currency,
        });
        providerRefundRef = res.providerRefundRef;
      } else {
        throw new BadRequestException(`Provider ${refund.provider} not supported in V1.`);
      }

      const updatedRefund = await tx.refund.update({
        where: { id: refund.id },
        data: { status: RefundStatus.SUCCEEDED, providerRefundRef },
      });

      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          type: PaymentEventType.REFUND,
          idempotencyKey,
          providerRef: providerRefundRef,
        },
      });

      return { ok: true, reused: false, refund: updatedRefund };
    });
  }
}
