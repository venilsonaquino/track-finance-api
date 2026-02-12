import { IsDateString, IsOptional } from 'class-validator';

export class PayInstallmentOccurrenceDto {
  @IsOptional()
  @IsDateString()
  depositedDate?: string;
}
