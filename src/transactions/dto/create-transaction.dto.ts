import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';

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

  @IsNotEmpty()
  @IsDefined()
  @IsEnum(TransactionType, {
    message: 'transactionType must be one of: INCOME, EXPENSE, TRANSFER',
  })
  transactionType: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus, {
    message: 'transactionStatus must be one of: POSTED, REVERSED',
  })
  transactionStatus?: TransactionStatus;

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
  @IsBoolean()
  affectBalance: boolean;
}
