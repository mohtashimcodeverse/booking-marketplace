import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';

type JsonObject = Record<string, unknown>;

@Injectable()
export class PortalNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private safePayload(payloadJson: string): JsonObject {
    try {
      const parsed = JSON.parse(payloadJson) as unknown;
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return parsed as JsonObject;
      }
      return {};
    } catch {
      return {};
    }
  }

  async listForUser(params: {
    userId: string;
    page: number;
    pageSize: number;
    unreadOnly?: boolean;
  }) {
    const page = params.page > 0 ? Math.floor(params.page) : 1;
    const pageSize =
      params.pageSize > 0 ? Math.min(100, Math.floor(params.pageSize)) : 20;

    const where = {
      recipientUserId: params.userId,
      ...(params.unreadOnly ? { readAt: null } : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.notificationEvent.count({ where }),
      this.prisma.notificationEvent.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          type: true,
          channel: true,
          status: true,
          entityType: true,
          entityId: true,
          payloadJson: true,
          attempts: true,
          lastError: true,
          createdAt: true,
          sentAt: true,
          readAt: true,
        },
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      items: items.map((item) => ({
        ...item,
        payload: this.safePayload(item.payloadJson),
        createdAt: item.createdAt.toISOString(),
        sentAt: item.sentAt?.toISOString() ?? null,
        readAt: item.readAt?.toISOString() ?? null,
      })),
    };
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notificationEvent.count({
      where: {
        recipientUserId: userId,
        readAt: null,
      },
    });
    return { unreadCount: count };
  }

  async markRead(params: { userId: string; notificationId: string }) {
    await this.prisma.notificationEvent.updateMany({
      where: {
        id: params.notificationId,
        recipientUserId: params.userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { ok: true, id: params.notificationId };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notificationEvent.updateMany({
      where: {
        recipientUserId: userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { ok: true, count: result.count };
  }
}
