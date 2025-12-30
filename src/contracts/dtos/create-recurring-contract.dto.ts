// src/recurring/dtos/create-recurring-contract.dto.ts
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from 'class-validator';
import { IntervalEnum } from '../enums/interval.enum';

export class CreateRecurringContractDto {
  @IsString()
  @IsNotEmpty()
  walletId: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  // DECIMAL como string: "119.90"
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'amount must be a decimal string like "119.90"',
  })
  amount: string;

  @IsEnum(IntervalEnum)
  interval: IntervalEnum;

  // "2026-01-05"
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'firstDueDate must be in YYYY-MM-DD format',
  })
  firstDueDate: string;

  /**
   * Quantas ocorrências gerar pra frente ao criar o contrato.
   * Se não enviar, você define um default (ex: 12).
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  generateAheadCount?: number;
}
