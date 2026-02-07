import { IsString, Length, Matches } from 'class-validator';

export class VerifyEmailOtpDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  otp!: string;
}
