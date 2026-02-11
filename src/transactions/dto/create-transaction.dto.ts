import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';
import { OfxDetailsDto } from './ofx-details.dto';

export class CreateTransactionDto {
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
  @IsDateString()
  depositedDate: string;

  @IsOptional()
  @IsBoolean()
  affectBalance?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => OfxDetailsDto)
  ofx?: OfxDetailsDto;
}
