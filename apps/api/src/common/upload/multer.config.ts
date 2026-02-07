import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';

const IMAGES_DIR = join(process.cwd(), 'uploads', 'properties', 'images');

/**
 * ✅ PRIVATE docs dir (NOT publicly served)
 * We intentionally keep this outside /uploads so that a future static rule
 * can never accidentally expose it.
 */
const DOCS_DIR = join(
  process.cwd(),
  'private_uploads',
  'properties',
  'documents',
);

export const imageUploadStorage = diskStorage({
  destination: (_req, _file, cb) => {
    mkdirSync(IMAGES_DIR, { recursive: true });
    cb(null, IMAGES_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const documentUploadStorage = diskStorage({
  destination: (_req, _file, cb) => {
    mkdirSync(DOCS_DIR, { recursive: true });
    cb(null, DOCS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
