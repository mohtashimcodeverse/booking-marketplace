import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type StrategyOptions } from 'passport-jwt';
import type { Request } from 'express';
import type { UserRole } from '@prisma/client';

export type JwtRefreshPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

function extractRefreshToken(req: Request): string | null {
  const cookies =
    (req as unknown as { cookies?: Record<string, string> }).cookies ?? {};
  const cookieToken = cookies['refresh_token'];
  if (typeof cookieToken === 'string' && cookieToken.trim())
    return cookieToken.trim();

  const headerToken = req.headers['x-refresh-token'];
  if (typeof headerToken === 'string' && headerToken.trim())
    return headerToken.trim();

  return null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    const options: StrategyOptions = {
      jwtFromRequest: (req: Request) => extractRefreshToken(req),
      secretOrKey: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
      passReqToCallback: false,
    };
    super(options);
  }

  validate(payload: JwtRefreshPayload): AuthUser {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
