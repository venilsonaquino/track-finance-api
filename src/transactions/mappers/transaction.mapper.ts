import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionModel } from '../models/transaction.model';

export class TransactionMapper {
  static toEntity(model: TransactionModel): TransactionEntity {
    const entity = new TransactionEntity({
      id: model.id,
      depositedDate: model.depositedDate,
      description: model.description,
      amount: model.amount,
      userId: model.userId,
      categoryId: model.categoryId,
      walletId: model.walletId,
      isRecurring: model.isRecurring,
      fitId: model.fitId,
      isInstallment: model.isInstallment,
      installmentInterval: model.installmentInterval as
        | 'DAILY'
        | 'MONTHLY'
        | 'WEEKLY'
        | 'YEARLY',
      installmentNumber: model.installmentNumber,
      installmentEndDate: model.installmentEndDate,
      transactionDate: model.transactionDate,
      transactionType: model.transactionType,
      accountId: model.accountId,
      accountType: model.accountType,
      bankId: model.bankId,
      bankName: model.bankName,
      currency: model.currency,
    });

    if (model.category) {
      entity.category = model.category;
    }

    if (model.wallet) {
      entity.wallet = model.wallet;
    }

    return entity;
  }
}
