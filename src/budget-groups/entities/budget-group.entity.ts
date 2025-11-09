import { ulid } from 'ulid';

export class BudgetGroupEntity {
  id: string;
  description: string;
  color?: string;
  userId?: string;

  constructor(
    params: Partial<{
      id: string;
      description: string;
      color?: string;
      userId?: string;
    }>,
  ) {
    this.id = params.id || ulid();
    this.description = params.description;
    this.color = params.color;
    this.userId = params.userId;
  }
}
