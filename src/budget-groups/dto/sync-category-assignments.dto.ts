import {
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class AssignmentItem {
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  budgetGroupId?: string | null;
}

export class SyncCategoryAssignmentsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AssignmentItem)
  assignments: AssignmentItem[];
}
