import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InstallmentContractModel } from './models/installment-contract.model';
import { InstallmentOccurrenceModel } from './models/installment-occurrence.model';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { RecurringContractModel } from './models/recurring-contract.model';
import { RecurringOccurrenceModel } from './models/recurring-occurrence.model';
import { WalletModel } from 'src/wallets/models/wallet.model';
import { CategoryModel } from 'src/categories/models/category.model';
import { TransactionModel } from 'src/transactions/models/transaction.model';
import { WalletsModule } from 'src/wallets/wallets.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      InstallmentContractModel,
      InstallmentOccurrenceModel,
      RecurringContractModel,
      RecurringOccurrenceModel,
      WalletModel,
      CategoryModel,
      TransactionModel,
    ]),
    WalletsModule,
    TransactionsModule,
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [SequelizeModule],
})
export class ContractsModule {}
