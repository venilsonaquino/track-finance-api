import { IsDateString, IsOptional, IsString } from 'class-validator';

export class PayCardStatementDto {
  @IsDateString()
  depositedDate: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  paymentWalletId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
