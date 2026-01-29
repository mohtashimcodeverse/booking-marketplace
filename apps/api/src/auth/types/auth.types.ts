import { UserRole } from '@prisma/client';

export type JwtAccessPayload = {
  sub: string; // userId
  email: string;
  role: UserRole;
};

export type JwtRefreshPayload = {
  sub: string; // userId
  typ: 'refresh';
};
