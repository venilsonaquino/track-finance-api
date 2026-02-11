import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransactionStatus } from 'src/transactions/enums/transaction-status.enum';
import { TransactionType } from 'src/transactions/enums/transaction-type.enum';

export class PayInstallmentOccurrenceDto {
  @IsEnum(TransactionType, {
    message: 'transactionType must be one of: INCOME, EXPENSE, TRANSFER',
  })
  transactionType: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus, {
    message: 'transactionStatus must be one of: POSTED, REVERSED',
  })
  transactionStatus?: TransactionStatus;

  @IsOptional()
  @IsDateString()
  depositedDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  affectBalance?: boolean;

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
