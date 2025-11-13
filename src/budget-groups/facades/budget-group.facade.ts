import { Injectable } from '@nestjs/common';
import { BudgetGroupsService } from '../budget-groups.service';
import { CreateBudgetGroupDto } from '../dto/create-budget-group.dto';
import { SyncCategoryAssignmentsDto } from '../dto/sync-category-assignments.dto';
import { BudgetOverviewDto } from '../dto/budget-overview.dto';

@Injectable()
export class BudgetGroupFacade {
  constructor(private readonly service: BudgetGroupsService) {}

  async createBudgetGroup(dtos: CreateBudgetGroupDto[]): Promise<void> {
    await this.service.createMany(dtos);
  }

  async findAllByUser(userId: string) {
    return this.service.findAllByUser(userId);
  }

  async syncCategoryAssignments(
    syncDto: SyncCategoryAssignmentsDto,
    userId: string,
  ) {
    return this.service.syncCategoryAssignments(syncDto, userId);
  }

  async getBudgetOverview(
    userId: string,
    year?: number,
  ): Promise<BudgetOverviewDto> {
    return this.service.getBudgetOverview(userId, year);
  }
}
