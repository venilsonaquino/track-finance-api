import { Injectable } from '@nestjs/common';
import { WalletsService } from '../wallets.service';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { WalletResponseDto } from '../dto/wallet-response.dto';
import { WalletFinancialType } from '../enums/wallet-financial-type.enum';

@Injectable()
export class WalletFacade {
  constructor(private readonly walletsService: WalletsService) {}

  async getWalletBalance(userId: string): Promise<number> {
    return this.walletsService.findBalanceCurrent(userId);
  }

  async createWallet(userId: string): Promise<WalletResponseDto> {
    const walletDto = new CreateWalletDto();

    walletDto.name = 'MainWallet';
    walletDto.description = 'Main Wallet';
    walletDto.walletType = 'Personal';
    walletDto.financialType = WalletFinancialType.Account;
    walletDto.balance = 0;
    walletDto.bankId = null;

    return this.walletsService.create(walletDto, userId);
  }

  async adjustWalletBalance(
    walletId: string,
    userId: string,
    amount: number,
  ): Promise<WalletResponseDto> {
    return this.walletsService.adjustBalance(walletId, userId, amount);
  }
}
