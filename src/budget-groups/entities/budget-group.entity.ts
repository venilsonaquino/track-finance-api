import { ulid } from 'ulid';
import { BudgetGroupKind } from '../enum/BudgetGroupKind';

export class BudgetGroupEntity {
  id: string;
  title: string;
  kind: BudgetGroupKind;
  color?: string;
  footerLabel: string;
  userId?: string;

  constructor(
    params: Partial<{
      id: string;
      title: string;
      kind: BudgetGroupKind;
      color?: string;
      footerLabel: string;
      userId?: string;
    }>,
  ) {
    this.id = params.id || ulid();
    this.title = params.title;
    this.kind = params.kind;
    this.color = params.color;
    this.footerLabel = params.footerLabel;
    this.userId = params.userId;
  }
}
