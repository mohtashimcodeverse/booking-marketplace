import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      ok: true,
      service: 'booking-marketplace-api',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        properties: '/api/properties',
        docs: '/docs',
      },
      ts: new Date().toISOString(),
    };
  }
}
