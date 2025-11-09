import { IsDefined, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BudgetGroupKind } from '../enum/BudgetGroupKind';

export class CreateBudgetGroupDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsEnum(BudgetGroupKind)
  kind?: BudgetGroupKind;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  footerLabel?: string;

 @IsDefined()
  @IsString()
  userId: string;
}
