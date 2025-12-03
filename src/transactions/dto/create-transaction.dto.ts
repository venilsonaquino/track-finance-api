import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateIf,
  Validate,
  IsIn,
  Min,
} from 'class-validator';
import { TransactionTypeConstraint } from '../validators/validate-transaction-type.constraint';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsDefined()
  @IsDateString()
  depositedDate: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDefined()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsBoolean()
  isRecurring: boolean;

  @IsOptional()
  @IsBoolean()
  isInstallment: boolean;

  @ValidateIf((o) => o.isInstallment === true)
  @IsDefined()
  @IsNumber()
  @Min(1)
  installmentNumber: number | null;

  @ValidateIf((o) => o.isInstallment === true)
  @IsIn(['DAILY', 'MONTHLY', 'WEEKLY', 'YEARLY'], {
    message:
      'installmentInterval must be one of: DAILY, MONTHLY, WEEKLY, YEARLY',
  })
  installmentInterval: 'DAILY' | 'MONTHLY' | 'WEEKLY' | 'YEARLY' | null;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  categoryId: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  walletId: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  fitId: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  accountId: string;

  @IsOptional()
  @IsString()
  accountType: string;

  @IsOptional()
  @IsString()
  bankId: string;

  @IsOptional()
  @IsString()
  bankName: string;

  @IsOptional()
  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  transactionDate: string;

  @IsOptional()
  @IsString()
  transactionType: string;

  @Validate(TransactionTypeConstraint)
  transactionTypeCheck: boolean; // para testar o validator

  @IsOptional()
  @IsBoolean()
  affectBalance: boolean;
}
