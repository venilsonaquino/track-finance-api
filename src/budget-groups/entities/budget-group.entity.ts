import { ulid } from 'ulid';
import { BudgetGroupKind } from '../enum/BudgetGroupKind';
import { BudgetGroupDomainException } from './budget-group-domain.exception';

export class BudgetGroupEntity {
  private static readonly SALDO_TITLE = 'SALDO';
  private static readonly RECEITAS_TITLE = 'RECEITAS';
  private static readonly SALDO_POSITION = 1;
  private static readonly RECEITAS_POSITION = 2;

  id: string;
  title: string;
  kind: BudgetGroupKind;
  color?: string;
  footerLabel?: string;
  position?: number;
  userId?: string;
  isSystemDefault?: boolean;

  constructor(
    params: Partial<{
      id: string;
      title: string;
      kind: BudgetGroupKind;
      color?: string;
      footerLabel?: string;
      position?: number;
      userId?: string;
      isSystemDefault?: boolean;
    }>,
  ) {
    this.id = params.id || ulid();
    this.title = params.title;
    this.kind = BudgetGroupKind.EDITABLE;
    this.color = params.color || '#470661ff';
    this.footerLabel = `Total ${params.title}`;
    this.position = params.position;
    this.userId = params.userId;
    this.isSystemDefault = false;
  }

  private get normalizedTitle() {
    return (this.title || '').toUpperCase();
  }

  get isSaldo(): boolean {
    return this.normalizedTitle === BudgetGroupEntity.SALDO_TITLE;
  }

  get isReceitas(): boolean {
    return this.normalizedTitle === BudgetGroupEntity.RECEITAS_TITLE;
  }

  get isSystemGroup(): boolean {
    return this.isSaldo || this.isReceitas || Boolean(this.isSystemDefault);
  }

  assertCanReceiveCategoryAssignments() {
    if (this.kind === BudgetGroupKind.COMPUTED) {
      throw new BudgetGroupDomainException('Cannot assign categories to computed budget groups (SALDO)');
    }
  }

  assertCanBeDeleted() {
    if (this.isSystemGroup) {
      throw new BudgetGroupDomainException('Cannot delete system budget groups');
    }
  }

  assertCanChangePosition(targetPosition: number) {
    if (this.isSaldo && targetPosition !== BudgetGroupEntity.SALDO_POSITION) {
      throw new BudgetGroupDomainException('SALDO deve sempre estar na posição 1 e não pode ser reordenado');
    }

    if (this.isReceitas && targetPosition !== BudgetGroupEntity.RECEITAS_POSITION) {
      throw new BudgetGroupDomainException('RECEITAS deve sempre estar na posição 2 e não pode ser reordenado');
    }
  }

  static assertPositionIsAvailable(targetPosition: number) {
    if (targetPosition === BudgetGroupEntity.SALDO_POSITION) {
      throw new BudgetGroupDomainException('Posição 1 é reservada para o grupo SALDO');
    }

    if (targetPosition === BudgetGroupEntity.RECEITAS_POSITION) {
      throw new BudgetGroupDomainException('Posição 2 é reservada para o grupo RECEITAS');
    }
  }

  enforceSystemPosition(): number | null {
    if (this.isSaldo && this.position !== BudgetGroupEntity.SALDO_POSITION) {
      this.position = BudgetGroupEntity.SALDO_POSITION;
      return this.position;
    }

    if (this.isReceitas && this.position !== BudgetGroupEntity.RECEITAS_POSITION) {
      this.position = BudgetGroupEntity.RECEITAS_POSITION;
      return this.position;
    }

    return null;
  }
}
