export class BudgetGroupDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BudgetGroupDomainException';
  }
}
