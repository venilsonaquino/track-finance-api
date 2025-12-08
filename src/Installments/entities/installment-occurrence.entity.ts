import { ulid } from 'ulid';
import { InstallmentOccurrenceStatus } from '../enums/installment-occurrence-status.enum';
import { InstallmentContractEntity } from './installment-contract.entity';
import { TransactionEntity } from 'src/transactions/entities/transaction.entity';

export class InstallmentOccurrenceEntity {
  id: string;
  contractId: string;
  installmentIndex: number;
  dueDate: string;
  amount: number;
  status: InstallmentOccurrenceStatus;
  transactionId?: string | null;
  contract?: InstallmentContractEntity;
  transaction?: TransactionEntity;

  constructor(
    params: Partial<{
      id: string;
      contractId: string;
      installmentIndex: number;
      dueDate: string;
      amount: number;
      status: InstallmentOccurrenceStatus;
      transactionId?: string | null;
      contract?: InstallmentContractEntity;
      transaction?: TransactionEntity;
    }>,
  ) {
    this.id = params.id || ulid();
    this.contractId = params.contractId;
    this.installmentIndex = params.installmentIndex;
    this.dueDate = params.dueDate;
    this.amount = params.amount;
    this.status = params.status || InstallmentOccurrenceStatus.Scheduled;
    this.transactionId = params.transactionId;
    this.contract = params.contract;
    this.transaction = params.transaction;
  }
}
