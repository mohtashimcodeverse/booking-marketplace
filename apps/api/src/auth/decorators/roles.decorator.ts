import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AUTH_ROLES_KEY } from '../auth.const';

export const Roles = (...roles: UserRole[]) => SetMetadata(AUTH_ROLES_KEY, roles);
