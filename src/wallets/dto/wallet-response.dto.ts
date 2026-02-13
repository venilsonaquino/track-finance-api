export class WalletResponseDto {
  id: string;
  name: string;
  description: string;
  walletType: string | null;
  financialType: 'ACCOUNT' | 'CREDIT_CARD';
  balance: number;
  userId: string;
  bankId: string | null;
  dueDay: number | null;
  closingDay: number | null;
  paymentAccountWalletId: string | null;
}
