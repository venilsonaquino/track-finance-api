import {
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { InstallmentInterval } from '../enums/installment-interval.enum';

export class InstallmentInfoDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsEnum(InstallmentInterval)
  interval: InstallmentInterval;

  @IsNotEmpty()
  @IsDateString()
  firstDueDate: string;
}