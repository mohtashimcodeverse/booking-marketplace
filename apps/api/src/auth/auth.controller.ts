import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RequestPasswordResetDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private cookieName() {
    return process.env.AUTH_COOKIE_NAME || 'rentpropertyuae_rt';
  }

  private cookieOptions() {
    const secure = (process.env.AUTH_COOKIE_SECURE || 'false') === 'true';
    const sameSite = (process.env.AUTH_COOKIE_SAMESITE || 'lax') as 'lax' | 'strict' | 'none';
    const domain = process.env.AUTH_COOKIE_DOMAIN || undefined;

    return {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      path: '/',
    } as const;
  }

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.fullName);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto.email, dto.password);

    res.cookie(this.cookieName(), result.refreshToken, {
      ...this.cookieOptions(),
      maxAge: 1000 * 60 * 60 * 24 * Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || '30'),
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const userId = req.user.id as string;
    const refreshToken = req.user.refreshToken as string;

    const result = await this.auth.refresh(userId, refreshToken);

    res.cookie(this.cookieName(), result.refreshToken, {
      ...this.cookieOptions(),
      maxAge: 1000 * 60 * 60 * 24 * Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || '30'),
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAccessGuard)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const cookieName = this.cookieName();
    const token = req.cookies?.[cookieName] as string | undefined;

    await this.auth.logout(req.user.id, token);
    res.clearCookie(cookieName, this.cookieOptions());

    return { ok: true };
  }

  @Post('verify-email')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto.token);
  }

  @Post('request-password-reset')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.auth.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.newPassword);
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  async me(@Req() req: any) {
    return { user: req.user };
  }
}
