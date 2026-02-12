import { OccurrenceStatusEnum } from '../enums/installment-occurrence-status.enum';
import { TransactionStatus } from 'src/transactions/enums/transaction-status.enum';

export type OccurrenceSource = 'generated' | 'override';

export class ContractOccurrenceDto {
  dueDate: string;
  amount: string;
  status: OccurrenceStatusEnum;
  transactionId: string | null;
  transactionStatus?: TransactionStatus | null;
  source: OccurrenceSource;
}
