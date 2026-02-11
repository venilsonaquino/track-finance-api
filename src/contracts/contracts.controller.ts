import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateInstallmentContractDto } from './dtos/create-Installment-contract.dto';
import { ContractsService } from './contracts.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateRecurringContractDto } from './dtos/create-recurring-contract.dto';
import { GetContractOccurrencesQueryDto } from './dtos/get-contract-occurrences-query.dto';
import { UpsertOccurrenceOverrideDto } from './dtos/upsert-occurrence-override.dto';
import { PayInstallmentOccurrenceDto } from './dtos/pay-installment-occurrence.dto';

@Controller('contracts')
@UseGuards(AuthGuard)
export class ContractsController {
  constructor(private readonly service: ContractsService) {}

  @Post('installments')
  async create(
    @Body() dto: CreateInstallmentContractDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createInstallmentContract(dto, user.id);
  }

  @Post('recurring')
  async createRecurring(
    @Body() dto: CreateRecurringContractDto,
    @CurrentUser() user: any,
  ) {
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

  @Patch(':contractId/occurrences/:dueDate')
  async overrideOccurrence(
    @Param('contractId') contractId: string,
    @Param('dueDate') dueDate: string,
    @Body() dto: UpsertOccurrenceOverrideDto,
    @CurrentUser() user: any,
  ) {
    return this.service.upsertOccurrenceOverride(
      contractId,
      dueDate,
      dto,
      user.id,
    );
  }

  @Post('installments/:contractId/occurrences/:installmentIndex/pay')
  async payInstallment(
    @Param('contractId') contractId: string,
    @Param('installmentIndex') installmentIndex: string,
    @Body() dto: PayInstallmentOccurrenceDto,
    @CurrentUser() user: any,
  ) {
    return this.service.payInstallmentOccurrence(
      contractId,
      Number(installmentIndex),
      dto,
      user.id,
    );
  }

  @Get(':contractId')
  async getContractById(
    @Param('contractId') contractId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.getContractById(contractId, user.id);
  }
}
