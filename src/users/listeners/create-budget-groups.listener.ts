import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { BudgetGroupKind } from "src/budget-groups/enum/BudgetGroupKind";
import { BudgetGroupFacade } from "src/budget-groups/facades/budget-group.facade";
import { LoggerService } from 'src/config/logging/logger.service';

@Injectable()
export class CreateBudgetGroupsListener {
  constructor(
    private readonly budgetGroupFacade: BudgetGroupFacade,  
    private readonly logger: LoggerService,
  ) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(payload: { userId: string }) {
    const defaultBudgetGroups = [
      { title: 'SALDO', kind: BudgetGroupKind.COMPUTED, color: '#18181b', footerLabel: 'Saldo', userId: payload.userId, isSystemDefault: true },
      { title: 'RECEITAS', kind: BudgetGroupKind.EDITABLE, color: '#00bc7d', footerLabel: 'Receitas', userId: payload.userId, isSystemDefault: true },
    ];

    await this.budgetGroupFacade.createBudgetGroup(defaultBudgetGroups);
    this.logger.log(`Default budget groups created for user ${payload.userId}`, 'CreateBudgetGroupsListener');
  }
}