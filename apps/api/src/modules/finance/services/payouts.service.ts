import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LedgerDirection,
  LedgerEntryType,
  PaymentProvider,
  PayoutStatus,
  Prisma,
  VendorStatementStatus,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

type AdminCreatePayoutFromStatementArgs = {
  statementId: string;
  provider: PaymentProvider;
  providerRef: string | null;
};

type AdminMarkProcessingArgs = {
  payoutId: string;
  providerRef?: string | null;
};

type AdminMarkSucceededArgs = {
  payoutId: string;
  providerRef?: string | null;
};

type AdminMarkFailedArgs = {
  payoutId: string;
  failureReason: string | null;
  providerRef?: string | null;
};

type AdminCancelArgs = {
  payoutId: string;
  reason: string | null;
};

type AdminListPayoutsArgs = {
  page: number;
  pageSize: number;
  status: PayoutStatus | null;
  vendorId: string | null;
};

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async adminListPayouts(args: AdminListPayoutsArgs) {
    const pageSize = Math.min(100, Math.max(1, args.pageSize));
    const page = Math.max(1, args.page);
    const skip = (page - 1) * pageSize;

    const where: Prisma.PayoutWhereInput = {};
    if (args.status) where.status = args.status;
    if (args.vendorId) where.vendorId = args.vendorId;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.payout.count({ where }),
      this.prisma.payout.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          vendorId: true,
          statementId: true,
          status: true,
          amount: true,
          currency: true,
          provider: true,
          providerRef: true,
          processedAt: true,
          failedAt: true,
          failureReason: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return { page, pageSize, total, items };
  }

  async adminGetPayoutDetail(args: { payoutId: string }) {
    const payout = await this.prisma.payout.findUnique({
      where: { id: args.payoutId },
      include: { statement: true },
    });
    if (!payout) throw new NotFoundException('Payout not found.');
    return payout;
  }

  /**
   * Create payout from a FINALIZED statement (idempotent).
   * If payout already exists, returns it.
   */
  async adminCreatePayoutFromStatement(
    args: AdminCreatePayoutFromStatementArgs,
  ) {
    const provider = args.provider ?? PaymentProvider.MANUAL;
    const providerRef = (args.providerRef ?? '').trim() || null;

    const result = await this.prisma.$transaction(
      async (tx) => {
        const statement = await tx.vendorStatement.findUnique({
          where: { id: args.statementId },
          include: { payout: true },
        });
        if (!statement) throw new NotFoundException('Statement not found.');

        if (statement.status !== VendorStatementStatus.FINALIZED) {
          throw new BadRequestException(
            `Statement must be FINALIZED to create a payout. Current: ${statement.status}`,
          );
        }

        if (statement.netPayable <= 0) {
          throw new BadRequestException('Statement netPayable must be > 0.');
        }

        if (statement.payout) {
          return {
            ok: true as const,
            reused: true as const,
            payout: statement.payout,
          };
        }

        const payout = await tx.payout.create({
          data: {
            vendorId: statement.vendorId,
            statementId: statement.id,
            status: PayoutStatus.PENDING,
            amount: statement.netPayable,
            currency: statement.currency,
            provider,
            providerRef,
          },
        });

        return { ok: true as const, reused: false as const, payout };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return result;
  }

  /**
   * Mark PROCESSING (idempotent).
   * Allowed from: PENDING
   */
  async adminMarkProcessing(args: AdminMarkProcessingArgs) {
    const providerRef = (args.providerRef ?? '').trim() || null;

    const result = await this.prisma.$transaction(
      async (tx) => {
        const payout = await tx.payout.findUnique({
          where: { id: args.payoutId },
        });
        if (!payout) throw new NotFoundException('Payout not found.');

        if (payout.status === PayoutStatus.PROCESSING) {
          if (providerRef && payout.providerRef !== providerRef) {
            const updated = await tx.payout.update({
              where: { id: payout.id },
              data: { providerRef },
            });
            return {
              ok: true as const,
              reused: true as const,
              payout: updated,
            };
          }
          return { ok: true as const, reused: true as const, payout };
        }

        if (payout.status !== PayoutStatus.PENDING) {
          return { ok: true as const, reused: true as const, payout };
        }

        const updated = await tx.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.PROCESSING,
            providerRef: providerRef ?? payout.providerRef ?? null,
          },
        });

        return { ok: true as const, reused: false as const, payout: updated };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return result;
  }

  /**
   * Mark SUCCEEDED and set statement -> PAID.
   * Creates a PAYOUT ledger entry idempotently using a deterministic key.
   *
   * Allowed from: PENDING, PROCESSING
   */
  async adminMarkSucceeded(args: AdminMarkSucceededArgs) {
    const providerRef = (args.providerRef ?? '').trim() || null;

    const idem = `admin_mark_succeeded_${args.payoutId}`;

    const result = await this.prisma.$transaction(
      async (tx) => {
        const payout = await tx.payout.findUnique({
          where: { id: args.payoutId },
          include: { statement: true },
        });
        if (!payout) throw new NotFoundException('Payout not found.');
        if (!payout.statement)
          throw new BadRequestException('Payout has no statement.');

        const statement = payout.statement;

        if (payout.status === PayoutStatus.SUCCEEDED) {
          return {
            ok: true as const,
            reused: true as const,
            payoutId: payout.id,
            statementId: statement.id,
          };
        }

        if (
          payout.status !== PayoutStatus.PENDING &&
          payout.status !== PayoutStatus.PROCESSING
        ) {
          throw new BadRequestException(
            `Cannot mark SUCCEEDED from status ${payout.status}.`,
          );
        }

        if (statement.status !== VendorStatementStatus.FINALIZED) {
          throw new BadRequestException(
            `Statement must be FINALIZED before payout success. Current: ${statement.status}`,
          );
        }

        if (statement.netPayable <= 0) {
          throw new BadRequestException('Statement netPayable must be > 0.');
        }

        const processedAt = new Date();
        const ledgerIdemKey = `payout_${idem}`;

        const existingLedger = await tx.ledgerEntry.findUnique({
          where: {
            vendorId_type_idempotencyKey: {
              vendorId: payout.vendorId,
              type: LedgerEntryType.PAYOUT,
              idempotencyKey: ledgerIdemKey,
            },
          },
          select: { id: true },
        });

        const updatedPayout = await tx.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.SUCCEEDED,
            processedAt,
            providerRef: providerRef ?? payout.providerRef ?? null,
            failureReason: null,
            failedAt: null,
          },
        });

        await tx.vendorStatement.update({
          where: { id: statement.id },
          data: {
            status: VendorStatementStatus.PAID,
            paidAt: processedAt,
          },
        });

        if (!existingLedger) {
          await tx.ledgerEntry.create({
            data: {
              vendorId: payout.vendorId,
              statementId: statement.id,
              type: LedgerEntryType.PAYOUT,
              direction: LedgerDirection.DEBIT,
              amount: statement.netPayable,
              currency: statement.currency,
              idempotencyKey: ledgerIdemKey,
              occurredAt: processedAt,
              metaJson: JSON.stringify({
                payoutId: updatedPayout.id,
                statementId: statement.id,
                provider: updatedPayout.provider,
                providerRef: updatedPayout.providerRef ?? null,
              }),
            },
          });
        }

        return {
          ok: true as const,
          reused: false as const,
          payoutId: updatedPayout.id,
          statementId: statement.id,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return result;
  }

  /**
   * Mark FAILED.
   * Allowed from: PENDING, PROCESSING
   */
  async adminMarkFailed(args: AdminMarkFailedArgs) {
    const providerRef = (args.providerRef ?? '').trim() || null;
    const reason = (args.failureReason ?? '').trim();

    if (!reason) throw new BadRequestException('failureReason is required.');

    const failedAt = new Date();

    const result = await this.prisma.$transaction(
      async (tx) => {
        const payout = await tx.payout.findUnique({
          where: { id: args.payoutId },
        });
        if (!payout) throw new NotFoundException('Payout not found.');

        if (payout.status === PayoutStatus.FAILED) {
          return { ok: true as const, reused: true as const, payout };
        }

        if (
          payout.status !== PayoutStatus.PENDING &&
          payout.status !== PayoutStatus.PROCESSING
        ) {
          throw new BadRequestException(
            `Cannot mark FAILED from status ${payout.status}.`,
          );
        }

        const updated = await tx.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.FAILED,
            failedAt,
            failureReason: reason,
            providerRef: providerRef ?? payout.providerRef ?? null,
          },
        });

        return { ok: true as const, reused: false as const, payout: updated };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return result;
  }

  /**
   * Cancel payout (admin).
   * Allowed from: PENDING
   */
  async adminCancel(args: AdminCancelArgs) {
    const reason = (args.reason ?? '').trim() || null;

    const result = await this.prisma.$transaction(
      async (tx) => {
        const payout = await tx.payout.findUnique({
          where: { id: args.payoutId },
        });
        if (!payout) throw new NotFoundException('Payout not found.');

        if (payout.status === PayoutStatus.CANCELLED) {
          return { ok: true as const, reused: true as const, payout };
        }

        if (payout.status !== PayoutStatus.PENDING) {
          throw new BadRequestException(
            `Cannot cancel from status ${payout.status}.`,
          );
        }

        const updated = await tx.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.CANCELLED,
            failureReason: reason,
            failedAt: new Date(),
          },
        });

        return { ok: true as const, reused: false as const, payout: updated };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return result;
  }
}
