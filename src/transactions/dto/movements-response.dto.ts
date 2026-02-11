import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';

export type MovementSource = 'transaction' | 'installment' | 'recurring';

export class MovementCategoryDto {
  id: string;
  name: string;
}

export class MovementWalletDto {
  id: string;
  name: string;
}

export class MovementItemDto {
  id: string;
  transactionId: string;
  date: string;
  description: string;
  amount: number;
  transactionType: TransactionType;
  transactionStatus: TransactionStatus;
  source: MovementSource;
  category?: MovementCategoryDto;
  wallet?: MovementWalletDto;
  contractId?: string;
  occurrenceId?: string;
  installmentIndex?: number;
  dueDate?: string;
}

export class MovementsMonthlyResponseDto {
  period: {
    year: number;
    month: number;
    start: string;
    end: string;
  };
  items: MovementItemDto[];
}
