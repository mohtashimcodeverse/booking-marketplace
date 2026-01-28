import { IsString } from 'class-validator';

export class PropertyDetailParams {
  @IsString()
  slug!: string;
}
