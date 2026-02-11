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
      fitId: model.ofx?.fitId ?? null,
      transactionDate: model.ofx?.transactionDate ?? null,
      transactionType: model.transactionType,
      transactionStatus: model.transactionStatus,
      accountId: model.ofx?.accountId ?? null,
      accountType: model.ofx?.accountType ?? null,
      bankId: model.ofx?.bankId ?? null,
      bankName: model.ofx?.bankName ?? null,
      currency: model.ofx?.currency ?? null,
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
