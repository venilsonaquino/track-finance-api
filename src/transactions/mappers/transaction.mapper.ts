import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionModel } from '../models/transaction.model';

export class TransactionMapper {
  static toEntity(model: TransactionModel): TransactionEntity {
    const entity = new TransactionEntity({
      id: model.id,
      depositedDate: model.depositedDate,
      description: model.description,
      amount: Number(model.amount),
      userId: model.userId,
      categoryId: model.categoryId,
      walletId: model.walletId,
      fitId: model.fitId,
      transactionDate: model.transactionDate,
      transactionType: model.transactionType,
      transactionStatus: model.transactionStatus,
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
