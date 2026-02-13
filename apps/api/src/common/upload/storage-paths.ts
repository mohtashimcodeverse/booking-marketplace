import { existsSync } from 'fs';
import { join, resolve } from 'path';

function hasApiMarkers(dir: string): boolean {
  return (
    existsSync(join(dir, 'prisma', 'schema.prisma')) ||
    existsSync(join(dir, 'src', 'main.ts')) ||
    existsSync(join(dir, 'dist', 'src', 'main.js'))
  );
}

function resolveApiRootDir(): string {
  const cwd = resolve(process.cwd());
  if (hasApiMarkers(cwd)) return cwd;

  const nested = resolve(cwd, 'apps', 'api');
  if (hasApiMarkers(nested)) return nested;

  return cwd;
}

export const API_ROOT_DIR = resolveApiRootDir();

export const PUBLIC_UPLOADS_DIR = join(API_ROOT_DIR, 'uploads');
export const PROPERTY_IMAGES_DIR = join(
  PUBLIC_UPLOADS_DIR,
  'properties',
  'images',
);

export const PRIVATE_UPLOADS_DIR = join(API_ROOT_DIR, 'private_uploads');
export const PROPERTY_DOCUMENTS_DIR = join(
  PRIVATE_UPLOADS_DIR,
  'properties',
  'documents',
);
export const BOOKING_DOCUMENTS_DIR = join(
  PRIVATE_UPLOADS_DIR,
  'bookings',
  'documents',
);
export const CUSTOMER_DOCUMENTS_DIR = join(
  PRIVATE_UPLOADS_DIR,
  'customers',
  'documents',
);

export const PROPERTY_DOCUMENTS_LEGACY_DIR = join(
  PUBLIC_UPLOADS_DIR,
  'properties',
  'documents',
);
