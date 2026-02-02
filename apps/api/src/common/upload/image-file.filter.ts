import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!file.mimetype.startsWith('image/')) {
    return callback(
      new BadRequestException('Only image files are allowed.'),
      false,
    );
  }

  callback(null, true);
}
