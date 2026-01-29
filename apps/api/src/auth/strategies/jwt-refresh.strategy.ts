import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { JwtRefreshPayload } from '../types/auth.types';

function extractRefreshToken(req: any): string | null {
  const cookieName = process.env.AUTH_COOKIE_NAME || 'rentpropertyuae_rt';
  const fromCookie = req?.cookies?.[cookieName];
  if (typeof fromCookie === 'string' && fromCookie.length > 10) return fromCookie;

  const auth = req?.headers?.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7);

  return null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: extractRefreshToken,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtRefreshPayload) {
    const token = extractRefreshToken(req);
    if (!token) throw new UnauthorizedException('Missing refresh token');
    return { id: payload.sub, refreshToken: token };
  }
}
