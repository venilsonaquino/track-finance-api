import { ulid } from 'ulid';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { WalletEntity } from 'src/wallets/entities/wallet.entity';

export class TransactionEntity {
  id: string;
  depositedDate: string;
  description: string;
  amount: number;
  userId: string;
  transferType: string | null;
  categoryId: string;
  walletId: string;
  fitId?: string | null;
  isRecurring?: boolean | null;
  isInstallment?: boolean | null;
  installmentInterval?: 'DAILY' | 'MONTHLY' | 'WEEKLY' | 'YEARLY' | null;
  installmentNumber?: number | null;
  installmentEndDate?: string | null;
  accountId?: string | null;
  accountType?: string | null;
  bankId?: string | null;
  bankName?: string | null;
  currency?: string | null;
  transactionDate?: string | null;
  transactionType?: string | null;
  category?: CategoryEntity;
  wallet?: WalletEntity;

  constructor(
    params: Partial<{
      id: string;
      depositedDate: string;
      description: string;
      amount: number;
      userId: string;
      transferType: string | null;
      categoryId: string | null;
      walletId: string;
      isRecurring?: boolean | null;
      recurringMonths?: number | null;
      fitId?: string;
      isInstallment?: boolean | null;
      installmentInterval?: 'DAILY' | 'MONTHLY' | 'WEEKLY' | 'YEARLY' | null;
      installmentNumber?: number | null;
      installmentEndDate?: string | null;
      accountId?: string | null;
      accountType?: string | null;
      bankId?: string | null;
      bankName?: string | null;
      currency?: string | null;
      transactionDate?: string | null;
      transactionType?: string | null;
      category?: CategoryEntity;
      wallet?: WalletEntity;
    }>,
  ) {
    this.id = params.id || ulid();
    this.depositedDate = params.depositedDate;
    this.description = params.description;
    this.amount = params.amount;
    this.userId = params.userId;
    this.transferType = params.transferType;
    this.categoryId = params.categoryId;
    this.walletId = params.walletId;
    this.isRecurring = params.isRecurring;
    this.fitId = params.fitId;

    this.isInstallment = params.isInstallment ?? false;
    this.isRecurring = params.isRecurring ?? false;

    this.installmentInterval = params.installmentInterval;
    this.installmentNumber = params.installmentNumber;

    if (
      this.isInstallment &&
      this.depositedDate &&
      this.installmentNumber &&
      this.installmentInterval
    ) {
      this.installmentEndDate = this.calculateInstallmentEndDate();
    } else {
      this.installmentEndDate = params.installmentEndDate;
    }

    this.accountId = params.accountId;
    this.accountType = params.accountType;
    this.bankId = params.bankId;
    this.bankName = params.bankName;
    this.currency = params.currency;
    this.transactionDate = params.transactionDate;
    this.transactionType = params.transactionType;

    this.category = params.category;
    this.wallet = params.wallet;

    this.ensureExclusiveFlags();
  }

  public static calculateIncome(transactions: TransactionEntity[]): number {
    return transactions
      .filter((t) => t.amount > 0 && t.transferType === 'CREDIT')
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
    transactionType?: string,
  ): number {
    const normalizedType = transactionType?.toUpperCase();

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

  private calculateInstallmentEndDate(): string {
    const startDate = new Date(this.depositedDate);

    switch (this.installmentInterval) {
      case 'DAILY':
        startDate.setDate(startDate.getDate() + (this.installmentNumber - 1));
        break;
      case 'WEEKLY':
        startDate.setDate(
          startDate.getDate() + (this.installmentNumber - 1) * 7,
        );
        break;
      case 'MONTHLY':
        startDate.setMonth(startDate.getMonth() + (this.installmentNumber - 1));
        break;
      case 'YEARLY':
        startDate.setFullYear(
          startDate.getFullYear() + (this.installmentNumber - 1),
        );
        break;
      default:
        return this.depositedDate;
    }

    return startDate.toISOString().split('T')[0];
  }

  private ensureExclusiveFlags(): void {
    if (this.isInstallment) {
      this.isRecurring = false;
    } else if (this.isRecurring) {
      this.isInstallment = false;
    }
  }
}
