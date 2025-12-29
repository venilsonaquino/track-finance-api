// src/installments/controllers/installment-contracts.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { CreateInstallmentContractDto } from './dtos/create-Installment-contract.dto';
import { InstallmentContractsService } from './installment-contracts.service';

@Controller('installments/contracts')
export class InstallmentContractsController {
  constructor(private readonly service: InstallmentContractsService) {}

  @Post()
  async create(@Body() dto: CreateInstallmentContractDto) {
    return this.service.createContract(dto);
  }
}
