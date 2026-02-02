import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../types/auth-user.type';
import type { AuthRequest } from '../types/auth-request.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    return req.user;
  },
);
