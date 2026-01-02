import { OccurrenceStatusEnum } from "../enums/installment-occurrence-status.enum";

export class UpsertOccurrenceOverrideDto {
  amount?: string;
  status?: OccurrenceStatusEnum;
  transactionId?: string | null;
}