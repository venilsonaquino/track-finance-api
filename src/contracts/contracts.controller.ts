// src/installments/controllers/installment-contracts.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateInstallmentContractDto } from './dtos/create-Installment-contract.dto';
import { ContractsService } from './contracts.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('contracts')
@UseGuards(AuthGuard)
export class ContractsController {
  constructor(private readonly service: ContractsService) {}

  @Post('installments')
  async create(@Body() dto: CreateInstallmentContractDto, @CurrentUser() user: any) {
    return this.service.createInstallmentContract(dto, user.id);
  }
}
