import { ulid } from 'ulid';
import MoneyHelper from '../helpers/money.helper';
import { WalletFinancialType } from '../enums/wallet-financial-type.enum';

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

  constructor(
    params: Partial<{
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
    }>,
  ) {
    this.id = params.id || ulid();
    this.name = params.name;
    this.description = params.description;
    this.walletType = params.walletType;
    this.financialType = params.financialType ?? WalletFinancialType.Account;
    this.balance = MoneyHelper.toCents(params.balance ?? 0);
    this.userId = params.userId;
    this.bankId = params.bankId;
    this.dueDay = params.dueDay ?? null;
    this.closingDay = params.closingDay ?? null;
    this.paymentAccountWalletId = params.paymentAccountWalletId ?? null;
  }
}
