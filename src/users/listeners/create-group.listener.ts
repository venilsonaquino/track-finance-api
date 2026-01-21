import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BudgetGroupKind } from 'src/budget-groups/enum/BudgetGroupKind';
import { BudgetGroupFacade } from 'src/budget-groups/facades/budget-group.facade';
import { LoggerService } from 'src/config/logging/logger.service';
import { UserCreatedEvent } from '../events/user-created.event';

@Injectable()
export class CreateGroupListener {
  constructor(
    private readonly budgetGroupFacade: BudgetGroupFacade,
    private readonly logger: LoggerService,
  ) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    const expenseGroups = [
      {
        title: 'GASTOS ESSENCIAIS',
        kind: BudgetGroupKind.EDITABLE,
        color: '#f59e0b',
        footerLabel: 'Essenciais',
        userId: event.userId,
        isSystemDefault: true,
        position: 3,
      },
      {
        title: 'DIVIDAS',
        kind: BudgetGroupKind.EDITABLE,
        color: '#ef4444',
        footerLabel: 'Dividas',
        userId: event.userId,
        isSystemDefault: true,
        position: 4,
      },
      {
        title: 'INVESTIMENTOS',
        kind: BudgetGroupKind.EDITABLE,
        color: '#22c55e',
        footerLabel: 'Investimentos',
        userId: event.userId,
        isSystemDefault: true,
        position: 5,
      },
      {
        title: 'OUTROS GASTOS',
        kind: BudgetGroupKind.EDITABLE,
        color: '#64748b',
        footerLabel: 'Outros',
        userId: event.userId,
        isSystemDefault: true,
        position: 6,
      },
    ];

    await this.budgetGroupFacade.createBudgetGroup(expenseGroups);
    this.logger.log(
      `Default expense budget groups created for user ${event.userId}`,
      'CreateGroupListener',
    );
  }
}
