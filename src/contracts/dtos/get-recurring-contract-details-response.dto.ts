import { TransactionStatus } from 'src/transactions/enums/transaction-status.enum';

export class RecurringOccurrenceItemDto {
  id: string | null;
  dueDate: string;
  amount: string;
  status: 'PAID' | 'FUTURE' | 'REVERSED' | 'CANCELLED' | 'SKIPPED' | 'PAUSED';
  transactionId: string | null;
  transactionStatus: TransactionStatus | null;
}

export class GetRecurringContractDetailsResponseDto {
  contractId: string;
  contract: {
    title: string | null;
    type: 'FIXED';
    recurrenceType: 'RECURRING';
    interval: string;
    amount: string;
    status: string;
    nextChargeDate: string | null;
    ends_at: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  recurringInfo: {
    value: string;
    periodicity: string;
    billingDay: number;
    valueChangedAt: string | null;
    nextValueChange: {
      effectiveFrom: string;
      amount: string;
    } | null;
    account: {
      id: string | null;
      name: string | null;
    };
    category: {
      id: string | null;
      name: string | null;
    };
    createdAt: string | null;
  };
  occurrenceHistory: {
    items: RecurringOccurrenceItemDto[];
    paidLimit: number;
    futureLimit: number;
    hasMoreHistory: boolean;
  };
  financialSummary: {
    totalPaid: string;
    activeMonths: number;
  };
}
