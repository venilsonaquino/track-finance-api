import { OccurrenceStatusEnum } from '../enums/installment-occurrence-status.enum';
import { RecurringContractEntity } from './recurring-contract.entity';
import { TransactionEntity } from 'src/transactions/entities/transaction.entity';

export class RecurringOccurrenceEntity {
  id: string;

  contractId: string;

  dueDate: string;
  amount: string;

  status: OccurrenceStatusEnum;

  transactionId?: string | null;

  createdAt?: Date;
  updatedAt?: Date;

  // relações
  contract?: RecurringContractEntity;
  transaction?: TransactionEntity;

  constructor(partial: Partial<RecurringOccurrenceEntity>) {
    Object.assign(this, partial);
  }
}
