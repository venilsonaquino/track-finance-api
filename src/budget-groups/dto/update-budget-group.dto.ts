import { PartialType } from '@nestjs/swagger';
import { CreateBudgetGroupRequest, CreateBudgetGroupResponse } from './create-budget-group.dto';

export class UpdateBudgetGroupRequest extends PartialType(CreateBudgetGroupRequest) {}
export class UpdateBudgetGroupResponse extends PartialType(CreateBudgetGroupResponse) {}
