export class WalletResponseDto {
  id: string;
  name: string;
  description: string;
  walletType: string | null;
  balance: number;
  userId: string;
  bankId: string | null;
}
