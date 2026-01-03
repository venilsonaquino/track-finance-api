import { ulid } from 'ulid';
import MoneyHelper from '../helpers/money.helper';

export class WalletEntity {
  id: string;
  name: string;
  description: string;
  walletType: string | null;
  balance: number | null;
  userId: string;
  bankId: string | null;

  constructor(
    params: Partial<{
      id: string;
      name: string;
      description: string;
      walletType: string | null;
      balance: number;
      userId: string;
      bankId: string | null;
    }>,
  ) {
    this.id = params.id || ulid();
    this.name = params.name;
    this.description = params.description;
    this.walletType = params.walletType;
    this.balance = MoneyHelper.toCents(params.balance);
    this.userId = params.userId;
    this.bankId = params.bankId;
  }
}
