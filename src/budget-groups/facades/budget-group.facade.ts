import { Injectable } from '@nestjs/common';
import { BudgetGroupsService } from '../budget-groups.service';
import { CreateBudgetGroupDto } from '../dto/create-budget-group.dto';

@Injectable()
export class BudgetGroupFacade {
  constructor(private readonly service: BudgetGroupsService) {}

  async createBudgetGroup(dtos: CreateBudgetGroupDto[]): Promise<void> {
    await this.service.createMany(dtos);
  }
}
