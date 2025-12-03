import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { WalletModel } from './models/wallet.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { WalletFacade } from './facades/wallet.facade';
import { LoggerModule } from 'src/config/logging/logger.module';

@Module({
  imports: [SequelizeModule.forFeature([WalletModel]), LoggerModule],
  controllers: [WalletsController],
  providers: [WalletsService, WalletFacade],
  exports: [WalletFacade],
})
export class WalletsModule {}
