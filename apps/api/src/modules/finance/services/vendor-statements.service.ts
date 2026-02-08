import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LedgerDirection,
  LedgerEntryType,
  Prisma,
  VendorStatementStatus,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

function startOfMonthUtc(year: number, month1to12: number): Date {
  return new Date(Date.UTC(year, month1to12 - 1, 1, 0, 0, 0));
}
function startOfNextMonthUtc(year: number, month1to12: number): Date {
  return new Date(Date.UTC(year, month1to12, 1, 0, 0, 0));
}

type AdminGenerateMonthlyStatementArgs = {
  adminUserId: string;
  vendorId: string;
  year: number;
  month: number; // 1..12
  currency: string | null;
};

type AdminGenerateMonthlyStatementsForAllArgs = {
  adminUserId: string;
  year: number;
  month: number; // 1..12
  currency: string | null;
};

type AdminFinalizeStatementArgs = {
  adminUserId: string;
  statementId: string;
  note: string | null;
};

type AdminVoidStatementArgs = {
  statementId: string;
  reason: string | null;
};

type VendorListStatementsArgs = {
  vendorId: string;
  page: number;
  pageSize: number;
};

type AdminListStatementsArgs = {
  page: number;
  pageSize: number;
  status: VendorStatementStatus | null;
  vendorId: string | null;
};

@Injectable()
export class VendorStatementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Core engine: upsert a DRAFT statement and attach eligible ledger entries in the period.
   * Period is [start, end) UTC.
   */
  private async upsertDraftForPeriod(
    tx: Prisma.TransactionClient,
    args: {
      vendorId: string;
      periodStart: Date;
      periodEnd: Date;
      currency: string;
    },
  ) {
    const currency = (args.currency ?? '').trim() || 'PKR';

    const statement = await tx.vendorStatement.upsert({
      where: {
        vendorId_periodStart_periodEnd: {
          vendorId: args.vendorId,
          periodStart: args.periodStart,
          periodEnd: args.periodEnd,
        },
      },
      create: {
        vendorId: args.vendorId,
        periodStart: args.periodStart,
        periodEnd: args.periodEnd,
        currency,
        status: VendorStatementStatus.DRAFT,
      },
      update: {
        currency,
      },
    });

    // Only mutate totals / ledger links while in DRAFT
    if (statement.status !== VendorStatementStatus.DRAFT) {
      return { statement, skipped: true as const, entryCount: 0 };
    }

    const entries = await tx.ledgerEntry.findMany({
      where: {
        vendorId: args.vendorId,
        currency,
        statementId: null,
        occurredAt: { gte: args.periodStart, lt: args.periodEnd },
        type: { not: LedgerEntryType.PAYOUT },
      },
      select: { id: true, type: true, direction: true, amount: true },
    });

    let grossBookings = 0;
    let managementFees = 0;
    let refunds = 0;
    let adjustments = 0;

    for (const e of entries) {
      if (
        e.type === LedgerEntryType.BOOKING_CAPTURED &&
        e.direction === LedgerDirection.CREDIT
      ) {
        grossBookings += e.amount;
      } else if (
        e.type === LedgerEntryType.MANAGEMENT_FEE &&
        e.direction === LedgerDirection.DEBIT
      ) {
        managementFees += e.amount;
      } else if (e.type === LedgerEntryType.REFUND) {
        refunds += e.direction === LedgerDirection.DEBIT ? e.amount : -e.amount;
      } else if (e.type === LedgerEntryType.ADJUSTMENT) {
        adjustments +=
          e.direction === LedgerDirection.CREDIT ? e.amount : -e.amount;
      }
    }

    const netPayable = Math.max(
      0,
      grossBookings - managementFees - refunds + adjustments,
    );

    if (entries.length > 0) {
      await tx.ledgerEntry.updateMany({
        where: { id: { in: entries.map((e) => e.id) } },
        data: { statementId: statement.id },
      });
    }

    const updated = await tx.vendorStatement.update({
      where: { id: statement.id },
      data: {
        grossBookings,
        managementFees,
        refunds,
        adjustments,
        netPayable,
        metaJson: JSON.stringify({
          entryCount: entries.length,
          computedAt: new Date().toISOString(),
        }),
      },
    });

    return {
      statement: updated,
      skipped: false as const,
      entryCount: entries.length,
    };
  }

  async adminGenerateMonthlyStatement(args: AdminGenerateMonthlyStatementArgs) {
    const year = args.year;
    const month = args.month;

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new BadRequestException('Invalid year.');
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException('Invalid month (1..12).');
    }

    const currency = (args.currency ?? '').trim() || 'PKR';
    const periodStart = startOfMonthUtc(year, month);
    const periodEnd = startOfNextMonthUtc(year, month);

    return this.prisma.$transaction(
      async (tx) => {
        return this.upsertDraftForPeriod(tx, {
          vendorId: args.vendorId.trim(),
          periodStart,
          periodEnd,
          currency,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async adminGenerateMonthlyStatementsForAll(
    args: AdminGenerateMonthlyStatementsForAllArgs,
  ) {
    const year = args.year;
    const month = args.month;

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new BadRequestException('Invalid year.');
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException('Invalid month (1..12).');
    }

    const currency = (args.currency ?? '').trim() || 'PKR';
    const periodStart = startOfMonthUtc(year, month);
    const periodEnd = startOfNextMonthUtc(year, month);

    const vendors = await this.prisma.user.findMany({
      where: { role: 'VENDOR' },
      select: { id: true },
    });

    const statementIds: string[] = [];
    let skipped = 0;

    for (const v of vendors) {
      const r = await this.prisma.$transaction(
        async (tx) => {
          return this.upsertDraftForPeriod(tx, {
            vendorId: v.id,
            periodStart,
            periodEnd,
            currency,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      statementIds.push(r.statement.id);
      if (r.skipped) skipped += 1;
    }

    return {
      ok: true as const,
      vendorCount: vendors.length,
      skipped,
      statementIds,
      periodStart,
      periodEnd,
      currency,
    };
  }

  async adminFinalizeStatement(args: AdminFinalizeStatementArgs) {
    // guards already enforce admin; adminUserId is for audit/log later
    const note = (args.note ?? '').trim() || null;

    return this.prisma.$transaction(
      async (tx) => {
        const st = await tx.vendorStatement.findUnique({
          where: { id: args.statementId },
        });
        if (!st) throw new NotFoundException('Statement not found.');

        if (st.status === VendorStatementStatus.PAID) {
          return { ok: true as const, reused: true as const, statement: st };
        }

        if (st.status === VendorStatementStatus.FINALIZED) {
          return { ok: true as const, reused: true as const, statement: st };
        }

        if (st.status !== VendorStatementStatus.DRAFT) {
          throw new BadRequestException(
            `Cannot finalize from status ${st.status}.`,
          );
        }

        const updated = await tx.vendorStatement.update({
          where: { id: st.id },
          data: {
            status: VendorStatementStatus.FINALIZED,
            finalizedAt: new Date(),
            metaJson: JSON.stringify({
              ...(st.metaJson ? { prevMetaJson: st.metaJson } : {}),
              finalizedByAdminUserId: args.adminUserId,
              note,
              finalizedAt: new Date().toISOString(),
            }),
          },
        });

        return {
          ok: true as const,
          reused: false as const,
          statement: updated,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /**
   * Void a statement:
   * - Cannot void PAID statements (audit safety).
   * - Can void DRAFT or FINALIZED.
   * - Detaches ledger entries so they can be re-stated later.
   */
  async adminVoidStatement(args: AdminVoidStatementArgs) {
    const reason = (args.reason ?? '').trim() || null;

    return this.prisma.$transaction(
      async (tx) => {
        const st = await tx.vendorStatement.findUnique({
          where: { id: args.statementId },
        });
        if (!st) throw new NotFoundException('Statement not found.');

        if (st.status === VendorStatementStatus.PAID) {
          throw new BadRequestException('Cannot void a PAID statement.');
        }

        if (st.status === VendorStatementStatus.VOID) {
          return { ok: true as const, reused: true as const, statement: st };
        }

        if (
          st.status !== VendorStatementStatus.DRAFT &&
          st.status !== VendorStatementStatus.FINALIZED
        ) {
          throw new BadRequestException(
            `Cannot void from status ${String(st.status)}.`,
          );
        }

        await tx.ledgerEntry.updateMany({
          where: { statementId: st.id },
          data: { statementId: null },
        });

        const updated = await tx.vendorStatement.update({
          where: { id: st.id },
          data: {
            status: VendorStatementStatus.VOID,
            metaJson: JSON.stringify({
              ...(st.metaJson ? { prevMetaJson: st.metaJson } : {}),
              voidReason: reason,
              voidedAt: new Date().toISOString(),
            }),
          },
        });

        return {
          ok: true as const,
          reused: false as const,
          statement: updated,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async vendorListStatements(args: VendorListStatementsArgs) {
    const pageSize = Math.min(100, Math.max(1, args.pageSize));
    const page = Math.max(1, args.page);
    const skip = (page - 1) * pageSize;

    const vendorId = (args.vendorId ?? '').trim();
    if (!vendorId) throw new BadRequestException('vendorId is required.');

    const where: Prisma.VendorStatementWhereInput = { vendorId };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.vendorStatement.count({ where }),
      this.prisma.vendorStatement.findMany({
        where,
        orderBy: [{ periodStart: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          vendorId: true,
          periodStart: true,
          periodEnd: true,
          currency: true,
          status: true,
          grossBookings: true,
          managementFees: true,
          refunds: true,
          adjustments: true,
          netPayable: true,
          generatedAt: true,
          finalizedAt: true,
          paidAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return { page, pageSize, total, items };
  }

  async vendorGetStatementDetail(args: {
    vendorId: string;
    statementId: string;
  }) {
    const st = await this.prisma.vendorStatement.findUnique({
      where: { id: args.statementId },
      include: {
        payout: true,
        ledgerEntries: {
          orderBy: { occurredAt: 'asc' },
          select: {
            id: true,
            type: true,
            direction: true,
            amount: true,
            currency: true,
            occurredAt: true,
            bookingId: true,
            paymentId: true,
            refundId: true,
            propertyId: true,
            metaJson: true,
          },
        },
      },
    });

    if (!st) throw new NotFoundException('Statement not found.');

    if (st.vendorId !== args.vendorId) {
      throw new ForbiddenException('You can only view your own statements.');
    }

    return st;
  }

  /**
   * ✅ Admin list for portal
   */
  async adminListStatements(args: AdminListStatementsArgs) {
    const pageSize = Math.min(100, Math.max(1, args.pageSize));
    const page = Math.max(1, args.page);
    const skip = (page - 1) * pageSize;

    const where: Prisma.VendorStatementWhereInput = {};
    if (args.status) where.status = args.status;
    if (args.vendorId) where.vendorId = args.vendorId;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.vendorStatement.count({ where }),
      this.prisma.vendorStatement.findMany({
        where,
        orderBy: [{ periodStart: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          vendorId: true,
          periodStart: true,
          periodEnd: true,
          currency: true,
          status: true,
          grossBookings: true,
          managementFees: true,
          refunds: true,
          adjustments: true,
          netPayable: true,
          generatedAt: true,
          finalizedAt: true,
          paidAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return { page, pageSize, total, items };
  }

  /**
   * ✅ Admin detail for portal
   */
  async adminGetStatementDetail(args: { statementId: string }) {
    const st = await this.prisma.vendorStatement.findUnique({
      where: { id: args.statementId },
      include: {
        payout: true,
        ledgerEntries: {
          orderBy: { occurredAt: 'asc' },
          select: {
            id: true,
            type: true,
            direction: true,
            amount: true,
            currency: true,
            occurredAt: true,
            bookingId: true,
            paymentId: true,
            refundId: true,
            propertyId: true,
            metaJson: true,
          },
        },
      },
    });

    if (!st) throw new NotFoundException('Statement not found.');
    return st;
  }
}
