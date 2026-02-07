import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWorkOrderDto {
  @ApiPropertyOptional({
    enum: ['DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    example: 'IN_PROGRESS',
  })
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  @ApiPropertyOptional({ example: 'uuid-of-assignee-user' })
  @IsOptional()
  @IsString()
  assignedToUserId?: string;

  @ApiPropertyOptional({ example: 'Technician scheduled for 3pm.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
