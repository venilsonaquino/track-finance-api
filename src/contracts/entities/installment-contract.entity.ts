import { ulid } from 'ulid';
import { ContractStatus } from '../enums/contract-status.enum';
import { InstallmentInterval } from '../enums/installment-interval.enum';
import { InstallmentOccurrenceEntity } from './installment-occurrence.entity';

export class InstallmentContractEntity {
  id: string;
  userId: string;
  walletId: string;
  categoryId: string;
  description?: string;
  totalAmount: number;
  installmentNumber: number;
  installmentInterval: InstallmentInterval;
  firstDueDate: string;
  status: ContractStatus;
  occurrences?: InstallmentOccurrenceEntity[];

  constructor(
    params: Partial<{
      id: string;
      userId: string;
      walletId: string;
      categoryId: string;
      description?: string;
      totalAmount: number;
      installmentNumber: number;
      installmentInterval: InstallmentInterval;
      firstDueDate: string;
      status: ContractStatus;
      occurrences?: InstallmentOccurrenceEntity[];
    }>,
  ) {
    this.id = params.id || ulid();
    this.userId = params.userId;
    this.walletId = params.walletId;
    this.categoryId = params.categoryId;
    this.description = params.description;
    this.totalAmount = params.totalAmount;
    this.installmentNumber = params.installmentNumber;
    this.installmentInterval = params.installmentInterval;
    this.firstDueDate = params.firstDueDate;
    this.status = params.status || ContractStatus.Active;
    this.occurrences = params.occurrences;
  }
}
