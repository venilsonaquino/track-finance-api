import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { InstallmentContractModel } from './models/installment-contract.model';
import { InstallmentOccurrenceModel } from './models/installment-occurrence.model';
import { CreateInstallmentContractDto } from './dtos/create-Installment-contract.dto';
import { OccurrenceStatusEnum } from './enums/installment-occurrence-status.enum';
import { generateDueDates } from 'src/common/utils/generate-due-dates';
import { ContractStatusEnum } from './enums/contract-status.enum';
import { CreateRecurringContractDto } from './dtos/create-recurring-contract.dto';
import { RecurringContractModel } from './models/recurring-contract.model';
import { RecurringOccurrenceModel } from './models/recurring-occurrence.model';
import { parseIsoDateOnly } from 'src/common/utils/parse-iso-date-only';
import { formatIsoDateOnly } from 'src/common/utils/format-iso-date-only';
import { Op } from 'sequelize';
import { OccurrenceProjection } from './occurrence-projection';
import { ContractOccurrenceDto } from './dtos/contract-occorence.dto';
import { GetContractOccurrencesQueryDto } from './dtos/get-contract-occurrences-query.dto';

@Injectable()
export class ContractsService {
  constructor(
    private readonly sequelize: Sequelize,
    @InjectModel(InstallmentContractModel)
    private readonly contractRepo: typeof InstallmentContractModel,
    @InjectModel(InstallmentOccurrenceModel)
    private readonly occurrenceRepo: typeof InstallmentOccurrenceModel,
      @InjectModel(RecurringContractModel)
    private readonly recurringContractRepo: typeof RecurringContractModel,

    @InjectModel(RecurringOccurrenceModel)
    private readonly recurringOccurrenceRepo: typeof RecurringOccurrenceModel,
  ) {}
  

  async createInstallmentContract(dto: CreateInstallmentContractDto, userId: string) {
    const generateOccurrences = dto.generateOccurrences ?? true;

    return this.sequelize.transaction(async (t) => {
      const contract = await this.contractRepo.create(
        {
          userId: userId,
          walletId: dto.walletId,
          categoryId: dto.categoryId,
          description: dto.description,
          totalAmount: dto.totalAmount,
          installmentsCount: dto.installmentsCount,
          installmentInterval: dto.installmentInterval,
          firstDueDate: dto.firstDueDate,
          status: ContractStatusEnum.Active,
        },
        { transaction: t },
      );

      let occurrences: InstallmentOccurrenceModel[] = [];

      if (generateOccurrences) {
        const perInstallmentAmount = this.calculateInstallmentAmount(
          dto.totalAmount,
          dto.installmentsCount,
        );

        const dueDates = generateDueDates(
          dto.firstDueDate,
          dto.installmentInterval,
          dto.installmentsCount,
        );

        occurrences = await this.occurrenceRepo.bulkCreate(
          dueDates.map((dueDate, idx) => ({
            contractId: contract.id,
            installmentIndex: idx + 1, // 1..N
            dueDate,
            amount: perInstallmentAmount,
            status: OccurrenceStatusEnum.Scheduled,
            transactionId: null,
          })),
          { transaction: t, returning: true },
        );
      }

      return {
        contract,
        occurrences,
      };
    });
  }

  async createRecurringContract(
    userId: string,
    dto: CreateRecurringContractDto,
  ) {
    return this.sequelize.transaction(async (transaction) => {
      const contract = await this.recurringContractRepo.create(
        {
          userId,
          walletId: dto.walletId,
          categoryId: dto.categoryId,
          description: dto.description,
          amount: dto.amount,
          interval: dto.interval,
          firstDueDate: dto.firstDueDate,
          status: ContractStatusEnum.Active,
        },
        { transaction },
      );

      return { contract };

    });
  }

  async getContractOccurrences(
    contractId: string,
    query: GetContractOccurrencesQueryDto,
    userId: string,
  ): Promise<{
    contractId: string;
    period: { from: string; to: string };
    items: ContractOccurrenceDto[];
  }> {

    const fromDate = parseIsoDateOnly(query.from)!;
    const toDate = parseIsoDateOnly(query.to)!;

    const contract = await this.recurringContractRepo.findOne({
      where: { id: contractId, userId: userId, status: ContractStatusEnum.Active },

    });
    
    if (!contract) throw new NotFoundException('Contract not found.');

    const dueDates = generateDueDates(
      contract.firstDueDate,
      contract.interval,
      fromDate,
      toDate,
    );

    const generated: ContractOccurrenceDto[] = dueDates.map((dueDate) => ({
      dueDate,
      amount: String(contract.amount),
      status: OccurrenceStatusEnum.Scheduled,
      transactionId: null,
      source: 'generated',
    }));

    const overridesModels = await this.recurringOccurrenceRepo.findAll({
      where: {
        contractId: contract.id,
        dueDate: {
          [Op.gte]: formatIsoDateOnly(fromDate),
          [Op.lte]: formatIsoDateOnly(toDate),
        },
      },
      order: [['dueDate', 'ASC']],
    });

    const overrides = overridesModels.map((m) => m.get({ plain: true }));

    const items = OccurrenceProjection.project(generated, []);

    return {
      contractId: contract.id,
      period: {
        from: query.from,
        to: query.to,
      },
      items,
    };
  }
  
  private calculateInstallmentAmount(totalAmount: string, installmentsCount: number): string {
    const totalCents = this.toCents(totalAmount);
    const per = Math.floor(totalCents / installmentsCount);
    return this.fromCents(per);
  }

  private toCents(value: string): number {
    const normalized = value.includes('.') ? value : `${value}.00`;
    const [intPart, decPartRaw] = normalized.split('.');
    const decPart = (decPartRaw ?? '00').padEnd(2, '0').slice(0, 2);
    return Number(intPart) * 100 + Number(decPart);
  }

  private fromCents(cents: number): string {
    const intPart = Math.floor(cents / 100);
    const decPart = String(cents % 100).padStart(2, '0');
    return `${intPart}.${decPart}`;
  }
}
