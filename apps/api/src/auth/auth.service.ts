import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../modules/prisma/prisma.service';
import { hashPassword, verifyPassword } from '../common/security/password';
import { generateRandomToken } from '../common/security/random';
import { hashToken, verifyToken } from '../common/security/token-hash';
import { JwtAccessPayload, JwtRefreshPayload } from './types/auth.types';
import { parseDurationToSeconds } from '../common/security/duration';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private accessExpiresSeconds(): number {
    const raw = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    return parseDurationToSeconds(raw, 15 * 60);
  }

  private refreshExpiresDays(): number {
    const v = Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || '30');
    return Number.isFinite(v) ? v : 30;
  }

  private refreshExpiryDate(): Date {
    const days = this.refreshExpiresDays();
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  async register(emailRaw: string, password: string, fullName?: string) {
    const email = emailRaw.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName?.trim() || null,
        role: UserRole.CUSTOMER,
        isEmailVerified: false,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        fullName: true,
      },
    });

    // demo-friendly: return token instead of emailing (we’ll email later with queues)
    const verifyTokenPlain = generateRandomToken(32);
    const verifyTokenHashed = await hashToken(verifyTokenPlain);

    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: verifyTokenHashed,
        expiresAt: expires,
      },
    });

    return {
      user,
      emailVerificationToken: verifyTokenPlain,
    };
  }

  async login(emailRaw: string, password: string) {
    const email = emailRaw.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const { refreshToken } = await this.issueRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(token: string) {
    const candidates = await this.prisma.emailVerificationToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    for (const c of candidates) {
      const match = await verifyToken(token, c.tokenHash);
      if (!match) continue;

      await this.prisma.$transaction([
        this.prisma.emailVerificationToken.update({
          where: { id: c.id },
          data: { usedAt: new Date() },
        }),
        this.prisma.user.update({
          where: { id: c.userId },
          data: { isEmailVerified: true },
        }),
      ]);

      return { ok: true };
    }

    throw new BadRequestException('Invalid or expired token');
  }

  async requestPasswordReset(emailRaw: string) {
    const email = emailRaw.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { ok: true };

    const tokenPlain = generateRandomToken(32);
    const tokenHashed = await hashToken(tokenPlain);

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 30);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHashed,
        expiresAt: expires,
      },
    });

    return { ok: true, resetToken: tokenPlain };
  }

  async resetPassword(token: string, newPassword: string) {
    const candidates = await this.prisma.passwordResetToken.findMany({
      where: { usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    for (const c of candidates) {
      const match = await verifyToken(token, c.tokenHash);
      if (!match) continue;

      const newHash = await hashPassword(newPassword);

      await this.prisma.$transaction([
        this.prisma.passwordResetToken.update({
          where: { id: c.id },
          data: { usedAt: new Date() },
        }),
        this.prisma.user.update({
          where: { id: c.userId },
          data: { passwordHash: newHash },
        }),
        this.prisma.refreshToken.updateMany({
          where: { userId: c.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);

      return { ok: true };
    }

    throw new BadRequestException('Invalid or expired token');
  }

  async refresh(userId: string, refreshTokenPlain: string) {
    const active = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    let matchedId: string | null = null;
    for (const rt of active) {
      const ok = await verifyToken(refreshTokenPlain, rt.tokenHash);
      if (ok) {
        matchedId = rt.id;
        break;
      }
    }
    if (!matchedId) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const newAccess = await this.signAccessToken(
      user.id,
      user.email,
      user.role,
    );
    const { refreshToken: newRefresh, recordId: newRecordId } =
      await this.issueRefreshToken(user.id);

    await this.prisma.refreshToken.update({
      where: { id: matchedId },
      data: { revokedAt: new Date(), replacedById: newRecordId },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken: newAccess,
      refreshToken: newRefresh,
    };
  }

  async logout(userId: string, refreshTokenPlain?: string) {
    if (!refreshTokenPlain) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return { ok: true };
    }

    const active = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    for (const rt of active) {
      const ok = await verifyToken(refreshTokenPlain, rt.tokenHash);
      if (!ok) continue;

      await this.prisma.refreshToken.update({
        where: { id: rt.id },
        data: { revokedAt: new Date() },
      });

      return { ok: true };
    }

    return { ok: true };
  }

  private async signAccessToken(userId: string, email: string, role: UserRole) {
    const payload: JwtAccessPayload = { sub: userId, email, role };
    return this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: this.accessExpiresSeconds(), // ✅ number
    });
  }

  private refreshExpiresSeconds(): number {
    return this.refreshExpiresDays() * 24 * 60 * 60;
  }

  private async issueRefreshToken(userId: string) {
    const payload: JwtRefreshPayload = { sub: userId, typ: 'refresh' };

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: this.refreshExpiresSeconds(),
    });

    const tokenHash = await hashToken(refreshToken);

    const record = await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: this.refreshExpiryDate(),
      },
      select: { id: true },
    });

    return { refreshToken, recordId: record.id };
  }
}
