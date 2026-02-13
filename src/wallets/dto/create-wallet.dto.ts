import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { WalletFinancialType } from '../enums/wallet-financial-type.enum';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  walletType?: string;

  @IsEnum(WalletFinancialType)
  @IsOptional()
  financialType?: WalletFinancialType;

  @IsString()
  @IsOptional()
  bankId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  closingDay?: number;

  @IsOptional()
  @IsString()
  paymentAccountWalletId?: string;

  @IsNumber()
  balance: number;
}
