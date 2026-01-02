import { OccurrenceStatusEnum } from '../enums/installment-occurrence-status.enum';

export type OccurrenceSource = 'generated' | 'override';

export class ContractOccurrenceDto {
  dueDate: string;
  amount: string;
  status: OccurrenceStatusEnum;
  transactionId: string | null;
  source: OccurrenceSource;
}
