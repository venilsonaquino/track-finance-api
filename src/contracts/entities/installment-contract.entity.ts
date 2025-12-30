import { ulid } from 'ulid';
import { InstallmentContractStatus } from '../enums/installment-contract-status.enum';
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
  status: InstallmentContractStatus;
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
      status: InstallmentContractStatus;
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
    this.status = params.status || InstallmentContractStatus.Active;
    this.occurrences = params.occurrences;
  }
}
