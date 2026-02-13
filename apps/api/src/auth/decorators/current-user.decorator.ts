import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../types/auth-user.type';
import type { AuthRequest } from '../types/auth-request.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): unknown => {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    const user: AuthUser | undefined = req.user;
    if (!data || typeof data !== 'string') return user;
    return (user as Record<string, unknown> | undefined)?.[data];
  },
);
