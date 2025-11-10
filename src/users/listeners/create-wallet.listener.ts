import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { UserCreatedEvent } from '../events/user-created.event';
import { WalletFacade } from 'src/wallets/facades/wallet.facade';
import { LoggerService } from 'src/config/logging/logger.service';

@Injectable()
export class CreateWalletListener {
  constructor(
    private readonly walletFacade: WalletFacade, 
    private readonly logger: LoggerService
  ) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    await this.walletFacade.createWallet(event.userId);

    this.logger.log(`Default wallet created for user ${event.userId}`, 'CreateWalletListener');
  }
}
