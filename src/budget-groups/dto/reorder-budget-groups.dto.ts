import { IsArray, IsString, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetGroupPositionDto {
  @IsString()
  id: string;

  @IsInt()
  @Min(0)
  position: number;
}

export class ReorderBudgetGroupsRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetGroupPositionDto)
  groups: BudgetGroupPositionDto[];
}

export class ReorderBudgetGroupsResponse {
  success: boolean;
}
