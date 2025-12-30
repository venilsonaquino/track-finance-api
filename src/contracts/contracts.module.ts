import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InstallmentContractModel } from './models/installment-contract.model';
import { InstallmentOccurrenceModel } from './models/installment-occurrence.model';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      InstallmentContractModel,
      InstallmentOccurrenceModel,
    ]),
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [SequelizeModule],
})
export class ContractsModule {}
