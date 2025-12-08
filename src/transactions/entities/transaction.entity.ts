import { ulid } from 'ulid';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { WalletEntity } from 'src/wallets/entities/wallet.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';

export class TransactionEntity {
  id: string;
  depositedDate: string;
  description: string;
  amount: number;
  userId: string;
  categoryId: string;
  walletId: string;
  transactionType: TransactionType;
  transactionStatus?: TransactionStatus | null;
  fitId?: string | null;
  transactionDate?: string | null;
  accountId?: string | null;
  accountType?: string | null;
  bankId?: string | null;
  bankName?: string | null;
  currency?: string | null;
  category?: CategoryEntity;
  wallet?: WalletEntity;

  constructor(
    params: Partial<{
      id: string;
      depositedDate: string;
      description: string;
      amount: number;
      userId: string;
      categoryId: string | null;
      walletId: string;
      transactionType: TransactionType;
      transactionStatus?: TransactionStatus | null;
      fitId?: string;
      accountId?: string | null;
      accountType?: string | null;
      bankId?: string | null;
      bankName?: string | null;
      currency?: string | null;
      transactionDate?: string | null;
      category?: CategoryEntity;
      wallet?: WalletEntity;
    }>,
  ) {
    this.id = params.id || ulid();
    this.depositedDate = params.depositedDate;
    this.description = params.description;
    this.amount = params.amount;
    this.userId = params.userId;
    this.categoryId = params.categoryId;
    this.walletId = params.walletId;
    this.transactionType = params.transactionType;
    this.transactionStatus = params.transactionStatus;
    this.fitId = params.fitId;
    this.accountId = params.accountId;
    this.accountType = params.accountType;
    this.bankId = params.bankId;
    this.bankName = params.bankName;
    this.currency = params.currency;
    this.transactionDate = params.transactionDate;

    this.category = params.category;
    this.wallet = params.wallet;
  }

  public static calculateIncome(transactions: TransactionEntity[]): number {
    return transactions
      .filter((t) => t.amount > 0 && t.transactionType === TransactionType.Income)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public static calculateExpense(transactions: TransactionEntity[]): number {
    return transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public static calculateMonthlyBalance(
    income: number,
    expense: number,
  ): number {
    return income + expense;
  }

  public static resolveBalanceDelta(
    amount: number,
    transactionType?: TransactionType | string,
  ): number {
    const normalizedType = transactionType?.toString().toUpperCase();

    if (normalizedType) {
      if (['INCOME', 'ENTRY', 'CREDIT'].includes(normalizedType)) {
        return Math.abs(amount);
      }

      if (
        ['OUTCOME', 'EXPENSE', 'DEBIT', 'WITHDRAW', 'PAYMENT'].includes(
          normalizedType,
        )
      ) {
        return -Math.abs(amount);
      }
    }

    return amount;
  }
}
