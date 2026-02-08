import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminFinalizeStatementDto {
  @ApiPropertyOptional({
    description:
      'Optional admin note or metadata snapshot (stored in metaJson).',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
