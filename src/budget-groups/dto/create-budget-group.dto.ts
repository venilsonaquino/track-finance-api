import { IsDefined, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { BudgetGroupKind } from '../enum/BudgetGroupKind';

export class CreateBudgetGroupResponse {
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

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  isSystemDefault?: boolean;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class CreateBudgetGroupRequest {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  color: string;
}
