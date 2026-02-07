import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { JwtAccessGuard } from '../../../auth/guards/jwt-access.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

import { UserRole, type User } from '@prisma/client';
import { PropertyDocumentsService } from '../documents/property-documents.service';

@Controller('admin/properties/:propertyId/documents')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPropertyDocumentsController {
  constructor(private readonly docs: PropertyDocumentsService) {}

  @Get(':documentId/download')
  async download(
    @Param('propertyId') propertyId: string,
    @Param('documentId') documentId: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const { stream, fileName, mimeType } = await this.docs.openDocumentStream({
      role: user.role,
      userId: user.id,
      propertyId,
      documentId,
    });

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    stream.on('error', () => {
      if (!res.headersSent) res.status(500);
      res.end();
    });

    stream.pipe(res);
  }
}
