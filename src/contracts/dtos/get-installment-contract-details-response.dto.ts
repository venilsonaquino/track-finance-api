import { TransactionStatus } from 'src/transactions/enums/transaction-status.enum';

export class InstallmentContractInstallmentItemDto {
  id: string;
  installmentIndex: number;
  dueDate: string;
  amount: string;
  status: 'PAID' | 'FUTURE' | 'REVERSED' | 'CANCELLED' | 'SKIPPED';
  transactionId: string | null;
  transactionStatus: TransactionStatus | null;
}

export class GetInstallmentContractDetailsResponseDto {
  contractId: string;
  header: {
    title: string | null;
    subtitle: string;
    installmentLabel: string;
    totalLabel: string;
    paidCount: number;
    futureCount: number;
    progress: {
      paid: number;
      total: number;
      percent: number;
    };
  };
  contractInfo: {
    categoryName: string | null;
    createdAt: string | null;
    billingDayLabel: string;
    account: {
      walletId: string;
      walletName: string | null;
      closingDay: number | null;
      dueDay: number | null;
      nextInvoice: string | null;
    };
  };
  installments: InstallmentContractInstallmentItemDto[];
}
