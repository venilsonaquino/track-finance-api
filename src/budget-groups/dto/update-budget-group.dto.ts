import { PartialType } from '@nestjs/swagger';
import { CreateBudgetGroupDto } from './create-budget-group.dto';

export class UpdateBudgetGroupDto extends PartialType(CreateBudgetGroupDto) {}
