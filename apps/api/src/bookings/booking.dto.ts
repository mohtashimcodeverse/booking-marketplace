import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  holdId!: string;

  // optional: allow header-based idempotency OR body-based
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
