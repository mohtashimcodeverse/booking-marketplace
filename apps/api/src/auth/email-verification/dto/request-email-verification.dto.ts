import { IsOptional, IsString } from 'class-validator';

export class RequestEmailVerificationDto {
  /**
   * Optional: if you later support verifying a different email.
   * For V1 we default to user's current email.
   */
  @IsOptional()
  @IsString()
  email?: string;
}
