import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InstallmentContractModel } from './models/installment-contract.model';
import { InstallmentOccurrenceModel } from './models/installment-occurrence.model';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { RecurringContractModel } from './models/recurring-contract.model';
import { RecurringOccurrenceModel } from './models/recurring-occurrence.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      InstallmentContractModel,
      InstallmentOccurrenceModel,
      RecurringContractModel,
      RecurringOccurrenceModel
    ]),
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [SequelizeModule],
})
export class ContractsModule {}
