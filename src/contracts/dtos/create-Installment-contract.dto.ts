import {
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { IntervalEnum } from '../enums/interval.enum';
import { TransactionType } from 'src/transactions/enums/transaction-type.enum';
import { TransactionStatus } from 'src/transactions/enums/transaction-status.enum';

export class CreateInstallmentContractDto {
  @IsString()
  @IsNotEmpty()
  walletId: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'totalAmount must be a decimal string like "3600.00"',
  })
  totalAmount: string;

  @IsInt()
  @Min(2)
  installmentsCount: number;

  @IsEnum(IntervalEnum)
  installmentInterval: IntervalEnum;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'firstDueDate must be in YYYY-MM-DD format',
  })
  firstDueDate: string;

  @IsOptional()
  generateOccurrences?: boolean; // default true

  @IsDefined()
  @IsEnum(TransactionType, {
    message: 'transactionType must be one of: INCOME, EXPENSE',
  })
  transactionType: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus, {
    message: 'transactionStatus must be one of: POSTED, REVERSED',
  })
  transactionStatus?: TransactionStatus;
}
