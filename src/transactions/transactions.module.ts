import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TransactionModel } from './models/transaction.model';
import { TransactionOfxModel } from './models/transaction-ofx.model';
import { InstallmentOccurrenceModel } from 'src/contracts/models/installment-occurrence.model';
import { RecurringOccurrenceModel } from 'src/contracts/models/recurring-occurrence.model';
import { InstallmentContractModel } from 'src/contracts/models/installment-contract.model';
import { RecurringContractModel } from 'src/contracts/models/recurring-contract.model';
import { RecurringContractRevisionModel } from 'src/contracts/models/recurring-contract-revision.model';
import { WalletsModule } from 'src/wallets/wallets.module';
import { LoggerModule } from 'src/config/logging/logger.module';
import { TransactionOfxService } from './transaction-ofx.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TransactionModel,
      TransactionOfxModel,
      InstallmentOccurrenceModel,
      RecurringOccurrenceModel,
      InstallmentContractModel,
      RecurringContractModel,
      RecurringContractRevisionModel,
    ]),
    WalletsModule,
    LoggerModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionOfxService],
  exports: [TransactionsService, TransactionOfxService],
})
export class TransactionsModule {}
