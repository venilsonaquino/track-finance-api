import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateInstallmentContractDto } from './dtos/create-Installment-contract.dto';
import { ContractsService } from './contracts.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateRecurringContractDto } from './dtos/create-recurring-contract.dto';
import { UpsertOccurrenceOverrideDto } from './dtos/upsert-occurrence-override.dto';
import { PayInstallmentOccurrenceDto } from './dtos/pay-installment-occurrence.dto';
import { UpdateOccurrenceAmountDto } from './dtos/update-occurrence-amount.dto';

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

  @Patch('installments/:contractId/occurrences/:installmentIndex/amount')
  async updateInstallmentOccurrenceAmount(
    @Param('contractId') contractId: string,
    @Param('installmentIndex') installmentIndex: string,
    @Body() dto: UpdateOccurrenceAmountDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateInstallmentOccurrenceAmount(
      contractId,
      Number(installmentIndex),
      dto.amount,
      user.id,
    );
  }

  @Patch('recurring/:contractId/occurrences/:dueDate/amount')
  async updateRecurringOccurrenceAmount(
    @Param('contractId') contractId: string,
    @Param('dueDate') dueDate: string,
    @Body() dto: UpdateOccurrenceAmountDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateRecurringOccurrenceAmount(
      contractId,
      dueDate,
      dto.amount,
      user.id,
    );
  }

  @Patch('recurring/:contractId/occurrences/:dueDate/amount/future')
  async updateRecurringOccurrenceAmountAndFuture(
    @Param('contractId') contractId: string,
    @Param('dueDate') dueDate: string,
    @Body() dto: UpdateOccurrenceAmountDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateRecurringOccurrenceAmountAndFuture(
      contractId,
      dueDate,
      dto.amount,
      user.id,
    );
  }

  @Patch('installments/:contractId/occurrences/:installmentIndex/pay')
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

  @Patch('recurring/:contractId/occurrences/:dueDate/pay')
  async payRecurring(
    @Param('contractId') contractId: string,
    @Param('dueDate') dueDate: string,
    @Body() dto: PayInstallmentOccurrenceDto,
    @CurrentUser() user: any,
  ) {
    return this.service.payRecurringOccurrence(
      contractId,
      dueDate,
      dto,
      user.id,
    );
  }

  @Get('installments/:contractId/details')
  async getInstallmentDetails(
    @Param('contractId') contractId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.getInstallmentContractDetails(contractId, user.id);
  }

  @Get('recurring/:contractId/details')
  async getRecurringDetails(
    @Param('contractId') contractId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.getRecurringContractDetails(contractId, user.id);
  }
}
