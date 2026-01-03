import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { InstallmentContractModel } from './models/installment-contract.model';
import { InstallmentOccurrenceModel } from './models/installment-occurrence.model';
import { CreateInstallmentContractDto } from './dtos/create-Installment-contract.dto';
import { OccurrenceStatusEnum } from './enums/installment-occurrence-status.enum';
import { generateDueDatesByCount } from 'src/common/utils/generate-due-dates-by-count';
import { ContractStatusEnum } from './enums/contract-status.enum';
import { CreateRecurringContractDto } from './dtos/create-recurring-contract.dto';
import { RecurringContractModel } from './models/recurring-contract.model';
import { RecurringOccurrenceModel } from './models/recurring-occurrence.model';
import { parseIsoDateOnly } from 'src/common/utils/parse-iso-date-only';
import { formatIsoDateOnly } from 'src/common/utils/format-iso-date-only';
import { Op } from 'sequelize';
import { OccurrenceProjection } from './occurrence-projection';
import { ContractOccurrenceDto, OccurrenceSource } from './dtos/contract-occorence.dto';
import { GetContractOccurrencesQueryDto } from './dtos/get-contract-occurrences-query.dto';
import { generateDueDatesInRange } from 'src/common/utils/generate-due-dates-in-range';
import { GetContractOccurrencesResponseDto } from './dtos/get-contract-occurrences-response.dto';
import { UpsertOccurrenceOverrideDto } from './dtos/upsert-occurrence-override.dto';
import { isDueDateOnSchedule } from 'src/common/utils/is-due-date-on-schedule';

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

        const dueDates = generateDueDatesByCount(
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
  ): Promise<GetContractOccurrencesResponseDto> {

    const fromDate = parseIsoDateOnly(query.from)!;
    const toDate = parseIsoDateOnly(query.to)!;

    const contract = await this.recurringContractRepo.findOne({
      where: { id: contractId, userId: userId, status: ContractStatusEnum.Active },

    });
    
    if (!contract) throw new NotFoundException('Contract not found.');

    const dueDates = generateDueDatesInRange(
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
      source: 'GENERATED' as OccurrenceSource,
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

    const items = OccurrenceProjection.project(generated, overrides);

    return {
      contractId: contract.id,
      period: {
        from: query.from,
        to: query.to,
      },
      items,
    };
  }

  async upsertOccurrenceOverride(
    contractId: string,
    dueDate: string,
    dto: UpsertOccurrenceOverrideDto,
    userId: string,
  ): Promise<{
    contractId: string;
    occurrence: ContractOccurrenceDto;
  }> 
  {
    // 1) valida dueDate (YYYY-MM-DD)
    const dueDateObj = parseIsoDateOnly(dueDate);
    if (!dueDateObj) {
      throw new BadRequestException('Invalid dueDate. Use YYYY-MM-DD.');
    }

    // 2) busca contrato do usuário
    const contract = await this.recurringContractRepo.findOne({
      where: { id: contractId, userId, status: ContractStatusEnum.Active },
    });
    if (!contract) throw new NotFoundException('Contract not found.');

    // 3) valida se dueDate cai na “grade” do contrato
    // (pra não permitir override em uma data que nunca existiria)
    if (!isDueDateOnSchedule(contract.firstDueDate, contract.interval, dueDate)) {
      throw new BadRequestException('dueDate is not valid for this contract schedule.');
    }

    // 4) monta o override final (defaults)
    const overrideToSave = {
      contractId: contract.id,
      dueDate, // DATEONLY string
      amount: dto.amount ?? String(contract.amount),
      status: dto.status ?? OccurrenceStatusEnum.Skipped, // << se quiser que PATCH sem body seja skip
      transactionId: dto.transactionId ?? null,
    };

    // regra mínima: se status = POSTED, geralmente exige transactionId
    if (overrideToSave.status === OccurrenceStatusEnum.Posted && !overrideToSave.transactionId) {
      throw new BadRequestException('transactionId is required when status is POSTED.');
    }

    // 5) upsert (ideal) - depende do seu repo/model suportar
    // Se seu Sequelize estiver configurado com unique (contractId, dueDate), upsert funciona bem.
    const saved = await this.sequelize.transaction(async (transaction) => {
      // opção A: upsert direto
      // return await this.occurrenceOverrideRepo.upsert(overrideToSave, { transaction, returning: true });

      // opção B: find + update/create (mais explícito e compatível)
      const existing = await this.recurringOccurrenceRepo.findOne({
        where: { contractId: contract.id, dueDate },
        transaction,
      });

      if (existing) {
        await existing.update(overrideToSave, { transaction });
        return existing;
      }

      return await this.recurringOccurrenceRepo.create(overrideToSave, { transaction });
    });

    const plain = saved.get ? saved.get({ plain: true }) : saved;

    return {
      contractId: contract.id,
      occurrence: {
        dueDate: plain.dueDate,
        amount: String(plain.amount),
        status: plain.status,
        transactionId: plain.transactionId ?? null,
        source: 'OVERRIDE' as OccurrenceSource,
      },
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
