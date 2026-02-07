import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOpsTaskDto {
  @ApiPropertyOptional({
    example: 'ASSIGNED',
    enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED'])
  status?: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

  @ApiPropertyOptional({ example: 'uuid-of-staff-user' })
  @IsOptional()
  @IsString()
  assignedToUserId?: string;

  @ApiPropertyOptional({ example: 'Use hypoallergenic linen set.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
