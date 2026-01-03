import { IsNotEmpty, IsDateString, IsEnum, IsNumber } from 'class-validator';
import { IntervalEnum } from '../enums/interval.enum';

export class InstallmentInfoDto {
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsNotEmpty()
  @IsEnum(IntervalEnum)
  interval: IntervalEnum;

  @IsNotEmpty()
  @IsDateString()
  firstDueDate: string;
}
