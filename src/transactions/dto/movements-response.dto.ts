import { TransactionType } from '../enums/transaction-type.enum';
import { OccurrenceStatusEnum } from 'src/contracts/enums/installment-occurrence-status.enum';

export type MovementSource = 'ACCOUNT' | 'CREDIT_CARD' | 'STATEMENT_PAYMENT';
export type MovementContractType = 'INSTALLMENT' | 'RECURRING';
export type MovementStatus = 'PAID' | 'SCHEDULED' | 'REVERSED';

export class MovementActionsDto {
  canMarkAsPaid: boolean;
  canReverse: boolean;
  canEditDueDate: boolean;
  canAdjustAmount: boolean;
  canSkip: boolean;
  canViewContract: boolean;
}

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
  transactionId?: string | null;
  date: string;
  description: string;
  amount: number;
  status: MovementStatus;
  direction?: TransactionType | null;
  source: MovementSource;
  category?: MovementCategoryDto;
  wallet?: MovementWalletDto;
  contractId?: string;
  occurrenceId?: string;
  installmentIndex?: number;
  dueDate?: string;
  contractType?: MovementContractType;
  occurrenceStatus?: OccurrenceStatusEnum | null;
  actions: MovementActionsDto;
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
