import { OccurrenceStatusEnum } from '../enums/installment-occurrence-status.enum';

import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpsertOccurrenceOverrideDto {
  @IsOptional()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsEnum(OccurrenceStatusEnum)
  status?: OccurrenceStatusEnum;

  @IsOptional()
  @IsString()
  transactionId?: string | null;

  @IsOptional()
  @IsBoolean()
  applyToFuture?: boolean;

  @IsOptional()
  @IsString()
  effectiveFrom?: string;
}
