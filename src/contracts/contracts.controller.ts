// src/installments/controllers/installment-contracts.controller.ts
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CreateInstallmentContractDto } from './dtos/create-Installment-contract.dto';
import { ContractsService } from './contracts.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateRecurringContractDto } from './dtos/create-recurring-contract.dto';
import { GetContractOccurrencesQueryDto } from './dtos/get-contract-occurrences-query.dto';

@Controller('contracts')
@UseGuards(AuthGuard)
export class ContractsController {
  constructor(private readonly service: ContractsService) {}

  @Post('installments')
  async create(@Body() dto: CreateInstallmentContractDto, @CurrentUser() user: any) {
    return this.service.createInstallmentContract(dto, user.id);
  }

  @Post('recurring')
  async createRecurring(@Body() dto: CreateRecurringContractDto, @CurrentUser() user: any) {
    return this.service.createRecurringContract(user.id, dto);
  }

  @Get(':contractId/occurrences')
  async getOccurrences(
    @Param('contractId') contractId: string,
    @Query() query: GetContractOccurrencesQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.service.getContractOccurrences(contractId, query, user.id);
  }
}
