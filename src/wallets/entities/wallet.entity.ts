import { BadRequestException } from '@nestjs/common';
import { ulid } from 'ulid';
import MoneyHelper from '../helpers/money.helper';
import { WalletFinancialType } from '../enums/wallet-financial-type.enum';

type WalletDraft = {
  id?: string;
  name?: string;
  description?: string;
  walletType?: string | null;
  financialType?: WalletFinancialType;
  balance?: number;
  userId?: string;
  bankId?: string | null;
  dueDay?: number | null;
  closingDay?: number | null;
  paymentAccountWalletId?: string | null;
};

type WalletCurrentState = {
  name: string;
  description: string;
  walletType: string | null;
  financialType: WalletFinancialType;
  balance: number;
  bankId: string | null;
  dueDay: number | null;
  closingDay: number | null;
  paymentAccountWalletId: string | null;
};

type WalletPatch = Partial<{
  name: string;
  description: string;
  walletType: string;
  financialType: WalletFinancialType;
  balance: number;
  bankId: string;
  dueDay: number;
  closingDay: number;
  paymentAccountWalletId: string;
}>;

export class WalletEntity {
  id: string;
  name: string;
  description: string;
  walletType: string | null;
  financialType: WalletFinancialType;
  balance: number;
  userId: string;
  bankId: string | null;
  dueDay: number | null;
  closingDay: number | null;
  paymentAccountWalletId: string | null;

  static fromUpdate(params: {
    id: string;
    userId: string;
    current: WalletCurrentState;
    patch: WalletPatch;
  }): WalletEntity {
    return WalletEntity.create({
      ...WalletEntity.mergePatch(params.current, params.patch),
      id: params.id,
      userId: params.userId,
    });
  }

  static create(draft: WalletDraft): WalletEntity {
    return new WalletEntity(draft);
  }

  private static mergePatch(
    current: WalletCurrentState,
    patch: WalletPatch,
  ): WalletDraft {
    const pick = <T>(next: T | undefined, previous: T | null): T | undefined =>
      next === undefined ? (previous ?? undefined) : next;

    return {
      name: pick(patch.name, current.name),
      description: pick(patch.description, current.description),
      walletType: pick(patch.walletType, current.walletType),
      financialType: pick(patch.financialType, current.financialType),
      balance:
        patch.balance === undefined
          ? MoneyHelper.centsToAmount(current.balance)
          : patch.balance,
      bankId: pick(patch.bankId, current.bankId),
      dueDay: pick(patch.dueDay, current.dueDay),
      closingDay: pick(patch.closingDay, current.closingDay),
      paymentAccountWalletId: pick(
        patch.paymentAccountWalletId,
        current.paymentAccountWalletId,
      ),
    };
  }

  constructor(params: WalletDraft) {
    const id = params.id ?? ulid();
    const financialType = params.financialType ?? WalletFinancialType.Account;
    const isCreditCard = financialType === WalletFinancialType.CreditCard;

    const name = WalletEntity.normalizeName(params.name);
    const description = params.description?.trim() ?? '';
    const walletType = params.walletType?.trim() || 'personal';
    const bankId = params.bankId?.trim() || null;

    const balance = WalletEntity.resolveBalance(params.balance, isCreditCard);
    const dueDay = WalletEntity.resolveDueDay(params.dueDay, isCreditCard);
    const closingDay = WalletEntity.resolveClosingDay(
      params.closingDay,
      isCreditCard,
    );
    WalletEntity.ensureDifferentStatementDays(dueDay, closingDay, isCreditCard);
    const paymentAccountWalletId = isCreditCard
      ? (params.paymentAccountWalletId ?? null)
      : null;
    WalletEntity.ensureNotSelfLinked(paymentAccountWalletId, id);

    this.id = id;
    this.name = name;
    this.description = description;
    this.walletType = walletType;
    this.financialType = financialType;
    this.balance = MoneyHelper.toCents(balance);
    this.userId = params.userId;
    this.bankId = bankId;
    this.dueDay = dueDay;
    this.closingDay = closingDay;
    this.paymentAccountWalletId = paymentAccountWalletId;
  }

  private static normalizeName(value?: string): string {
    const normalized = value?.trim();
    if (!normalized) {
      throw new BadRequestException('Wallet name is required.');
    }
    return normalized;
  }

  private static resolveBalance(
    value: number | undefined,
    isCreditCard: boolean,
  ): number {
    if (isCreditCard) {
      return 0;
    }

    const balance = value ?? 0;
    if (balance < 0) {
      throw new BadRequestException(
        'Account wallet initial balance must be greater than or equal to zero.',
      );
    }
    return balance;
  }

  private static resolveDueDay(
    value: number | null | undefined,
    isCreditCard: boolean,
  ): number | null {
    const dueDay = isCreditCard ? (value ?? null) : null;
    if (isCreditCard && !dueDay) {
      throw new BadRequestException(
        'Credit card wallets require dueDay (1-31).',
      );
    }
    return dueDay;
  }

  private static resolveClosingDay(
    value: number | null | undefined,
    isCreditCard: boolean,
  ): number | null {
    const closingDay = isCreditCard ? (value ?? null) : null;
    if (isCreditCard && !closingDay) {
      throw new BadRequestException(
        'Credit card wallets require closingDay (1-31).',
      );
    }
    return closingDay;
  }

  private static ensureDifferentStatementDays(
    dueDay: number | null,
    closingDay: number | null,
    isCreditCard: boolean,
  ): void {
    if (isCreditCard && dueDay && closingDay && dueDay === closingDay) {
      throw new BadRequestException(
        'Credit card wallets cannot have dueDay equal to closingDay.',
      );
    }
  }

  private static ensureNotSelfLinked(
    paymentAccountWalletId: string | null,
    walletId: string,
  ): void {
    if (paymentAccountWalletId && paymentAccountWalletId === walletId) {
      throw new BadRequestException(
        'Payment account wallet cannot reference itself.',
      );
    }
  }
}
