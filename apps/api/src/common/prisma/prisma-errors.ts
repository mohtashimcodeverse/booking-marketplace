// apps/api/src/common/prisma/prisma-errors.ts
import { Prisma } from '@prisma/client';

export function isPrismaKnownError(
  err: unknown,
): err is Prisma.PrismaClientKnownRequestError {
  return err instanceof Prisma.PrismaClientKnownRequestError;
}

export function isPrismaUniqueConstraintError(err: unknown): boolean {
  return isPrismaKnownError(err) && err.code === 'P2002';
}
