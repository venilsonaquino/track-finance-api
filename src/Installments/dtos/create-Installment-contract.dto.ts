import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from 'class-validator';
import { InstallmentInterval } from '../enums/installment-interval.enum';

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
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'totalAmount must be a decimal string like "3600.00"' })
  totalAmount: string;

  @IsInt()
  @Min(2)
  installmentsCount: number;

  @IsEnum(InstallmentInterval)
  installmentInterval: InstallmentInterval;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'firstDueDate must be in YYYY-MM-DD format' })
  firstDueDate: string;

  @IsOptional()
  generateOccurrences?: boolean; // default true
}