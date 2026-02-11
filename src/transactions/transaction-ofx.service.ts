import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TransactionOfxModel } from './models/transaction-ofx.model';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionOfxService {
  constructor(
    @InjectModel(TransactionOfxModel)
    private readonly transactionOfxModel: typeof TransactionOfxModel,
  ) {}

  buildPayload(
    dto: Partial<CreateTransactionDto>,
    transactionId: string,
  ): Partial<TransactionOfxModel> | null {
    const ofx = dto.ofx;
    if (!ofx) {
      return null;
    }

    const payload: Partial<TransactionOfxModel> = {
      transactionId,
      fitId: this.normalizeOfxValue(ofx.fitId),
      accountId: this.normalizeOfxValue(ofx.accountId),
      accountType: this.normalizeOfxValue(ofx.accountType),
      bankId: this.normalizeOfxValue(ofx.bankId),
      bankName: this.normalizeOfxValue(ofx.bankName),
      currency: this.normalizeOfxValue(ofx.currency),
    };

    const hasAnyValue = [
      payload.fitId,
      payload.accountId,
      payload.accountType,
      payload.bankId,
      payload.bankName,
      payload.currency,
    ].some((value) => value !== null && value !== undefined);

    return hasAnyValue ? payload : null;
  }

  async createDetails(
    payload: Partial<TransactionOfxModel>,
    transaction?: any,
  ) {
    if (!payload) {
      return;
    }
    await this.transactionOfxModel.create(payload as any, { transaction });
  }

  async bulkCreateDetails(
    payloads: Partial<TransactionOfxModel>[],
    transaction?: any,
  ) {
    if (!payloads || payloads.length === 0) {
      return;
    }
    await this.transactionOfxModel.bulkCreate(payloads as any, { transaction });
  }

  async syncDetails(
    transactionId: string,
    dto: Partial<CreateTransactionDto>,
    transaction?: any,
  ) {
    if (!Object.prototype.hasOwnProperty.call(dto, 'ofx')) {
      return;
    }

    const ofx = dto.ofx;
    if (!ofx) {
      await this.transactionOfxModel.destroy({
        where: { transactionId },
        transaction,
      });
      return;
    }

    const updates: Partial<TransactionOfxModel> = {
      fitId: this.normalizeOfxValue(ofx.fitId),
      accountId: this.normalizeOfxValue(ofx.accountId),
      accountType: this.normalizeOfxValue(ofx.accountType),
      bankId: this.normalizeOfxValue(ofx.bankId),
      bankName: this.normalizeOfxValue(ofx.bankName),
      currency: this.normalizeOfxValue(ofx.currency),
    };

    const hasAnyValue = Object.values(updates).some(
      (value) => value !== null && value !== undefined,
    );

    if (!hasAnyValue) {
      await this.transactionOfxModel.destroy({
        where: { transactionId },
        transaction,
      });
      return;
    }

    const existing = await this.transactionOfxModel.findOne({
      where: { transactionId },
      transaction,
    });

    if (existing) {
      await existing.update(updates, { transaction });
      return;
    }

    await this.transactionOfxModel.create(
      { transactionId, ...updates } as any,
      { transaction },
    );
  }

  private normalizeOfxValue(value?: string | null) {
    if (value === undefined || value === null) {
      return null;
    }
    const trimmed = typeof value === 'string' ? value.trim() : String(value);
    return trimmed.length === 0 ? null : trimmed;
  }
}
