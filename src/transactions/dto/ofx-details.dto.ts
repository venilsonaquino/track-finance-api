import { IsOptional, IsString } from 'class-validator';

export class OfxDetailsDto {
  @IsOptional()
  @IsString()
  fitId?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  accountType?: string;

  @IsOptional()
  @IsString()
  bankId?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
