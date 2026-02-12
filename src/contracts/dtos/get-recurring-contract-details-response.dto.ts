export class RecurringOccurrenceItemDto {
  id: string | null;
  dueDate: string;
  amount: string;
  status: 'PAID' | 'FUTURE';
  transactionId: string | null;
  transactionStatus: string | null;
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
  };
  recurringInfo: {
    value: string;
    periodicity: string;
    billingDay: number;
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
