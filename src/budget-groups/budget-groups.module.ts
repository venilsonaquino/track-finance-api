import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerModule } from 'src/config/logging/logger.module';
import { BudgetGroupsController } from './budget-groups.controller';
import { BudgetGroupsService } from './budget-groups.service';
import { BudgetGroupModel } from './models/budget-group.model';
import { BudgetGroupFacade } from './facades/budget-group.facade';

@Module({
  imports: [SequelizeModule.forFeature([BudgetGroupModel]), LoggerModule],
  controllers: [BudgetGroupsController],
  providers: [BudgetGroupsService, BudgetGroupFacade],
  exports: [BudgetGroupFacade],
})
export class BudgetGroupsModule {}
