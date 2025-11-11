import { IsArray, IsString, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetGroupPositionDto {
  @IsString()
  id: string;

  @IsInt()
  @Min(0)
  position: number;
}

export class ReorderBudgetGroupsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetGroupPositionDto)
  groups: BudgetGroupPositionDto[];
}