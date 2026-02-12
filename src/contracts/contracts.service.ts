import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import {
  ContractOccurrenceDto,
  OccurrenceSource,
} from './dtos/contract-occorence.dto';
import { GetContractOccurrencesQueryDto } from './dtos/get-contract-occurrences-query.dto';
import { generateDueDatesInRange } from 'src/common/utils/generate-due-dates-in-range';
import { GetContractOccurrencesResponseDto } from './dtos/get-contract-occurrences-response.dto';
import { UpsertOccurrenceOverrideDto } from './dtos/upsert-occurrence-override.dto';
import { isDueDateOnSchedule } from 'src/common/utils/is-due-date-on-schedule';
import { WalletModel } from 'src/wallets/models/wallet.model';
import { CategoryModel } from 'src/categories/models/category.model';
import { TransactionModel } from 'src/transactions/models/transaction.model';
import { WalletFacade } from 'src/wallets/facades/wallet.facade';
import { PayInstallmentOccurrenceDto } from './dtos/pay-installment-occurrence.dto';
import { TransactionStatus } from 'src/transactions/enums/transaction-status.enum';
import { TransactionEntity } from 'src/transactions/entities/transaction.entity';
import { GetInstallmentContractDetailsResponseDto } from './dtos/get-installment-contract-details-response.dto';
import { GetRecurringContractDetailsResponseDto } from './dtos/get-recurring-contract-details-response.dto';
import { createDueDateBuilder } from 'src/common/utils/create-due-date-builder';

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
    @InjectModel(WalletModel)
    private readonly walletRepo: typeof WalletModel,
    @InjectModel(CategoryModel)
    private readonly categoryRepo: typeof CategoryModel,
    @InjectModel(TransactionModel)
    private readonly transactionRepo: typeof TransactionModel,
    private readonly walletFacade: WalletFacade,
  ) {}

  async createInstallmentContract(
    dto: CreateInstallmentContractDto,
    userId: string,
  ) {
    const generateOccurrences = dto.generateOccurrences ?? true;

    const wallet = await this.walletRepo.findOne({
      where: { id: dto.walletId, userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found for user.');
    }

    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found for user.');
    }

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
          transactionType: dto.transactionType,
          transactionStatus: dto.transactionStatus ?? TransactionStatus.Posted,
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
    const wallet = await this.walletRepo.findOne({
      where: { id: dto.walletId, userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found for user.');
    }

    return this.sequelize.transaction(async (transaction) => {
      const contract = await this.recurringContractRepo.create(
        {
          userId,
          walletId: dto.walletId,
          categoryId: dto.categoryId,
          description: dto.description,
          amount: dto.amount,
          installmentInterval: dto.installmentInterval,
          firstDueDate: dto.firstDueDate,
          status: ContractStatusEnum.Active,
          transactionType: dto.transactionType,
          transactionStatus: dto.transactionStatus ?? TransactionStatus.Posted,
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
      where: {
        id: contractId,
        userId: userId,
        status: ContractStatusEnum.Active,
      },
    });

    if (!contract) throw new NotFoundException('Contract not found.');

    const dueDates = generateDueDatesInRange(
      contract.firstDueDate,
      contract.installmentInterval,
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
    const transactionStatusById = await this.getTransactionStatusByIds(
      items.map((item) => item.transactionId).filter(Boolean) as string[],
      userId,
    );

    const itemsWithTransactionStatus = items.map((item) => ({
      ...item,
      transactionStatus: item.transactionId
        ? (transactionStatusById.get(item.transactionId) ?? null)
        : null,
    }));

    return {
      contractId: contract.id,
      period: {
        from: query.from,
        to: query.to,
      },
      items: itemsWithTransactionStatus,
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
  }> {
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
    if (
      !isDueDateOnSchedule(contract.firstDueDate, contract.installmentInterval, dueDate)
    ) {
      throw new BadRequestException(
        'dueDate is not valid for this contract schedule.',
      );
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
    if (
      overrideToSave.status === OccurrenceStatusEnum.Posted &&
      !overrideToSave.transactionId
    ) {
      throw new BadRequestException(
        'transactionId is required when status is POSTED.',
      );
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

      return await this.recurringOccurrenceRepo.create(overrideToSave, {
        transaction,
      });
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

  async getContractById(contractId: string, userId: string) {
    const contract = await this.recurringContractRepo.findOne({
      where: { id: contractId, userId },
    });
    if (!contract) throw new NotFoundException('Contract not found.');
    return contract;
  }

  async getInstallmentContractDetails(
    contractId: string,
    userId: string,
  ): Promise<GetInstallmentContractDetailsResponseDto> {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId, userId },
      include: [
        { model: CategoryModel, as: 'category' },
        { model: WalletModel, as: 'wallet' },
        { model: InstallmentOccurrenceModel, as: 'occurrences' },
      ],
    });

    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }

    const occurrences = [...(contract.occurrences ?? [])].sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate),
    );

    const transactionStatusById = await this.getTransactionStatusByIds(
      occurrences.map((occ) => occ.transactionId).filter(Boolean) as string[],
      userId,
    );
    const mappedInstallments = occurrences.map((occ) => {
      const transactionStatus = occ.transactionId
        ? (transactionStatusById.get(occ.transactionId) ?? null)
        : null;
      const status = this.resolveOccurrenceStatus(
        occ.installmentStatus,
        transactionStatus,
      );
      return {
        id: occ.id,
        installmentIndex: occ.installmentIndex,
        dueDate: occ.dueDate,
        amount: this.formatBrlAmount(occ.amount),
        status,
        transactionId: occ.transactionId ?? null,
        transactionStatus,
      };
    });

    const paidCount = mappedInstallments.filter(
      (occ) => occ.status === 'PAID' || occ.status === 'REVERSED',
    ).length;
    const totalCount = contract.installmentsCount ?? occurrences.length;
    const futureCount = Math.max(totalCount - paidCount, 0);
    const percent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

    const installmentAmount = occurrences[0]?.amount ?? this.calculateInstallmentAmount(
      contract.totalAmount,
      contract.installmentsCount,
    );

    const today = formatIsoDateOnly(new Date());
    const nextOccurrence = mappedInstallments.find(
      (occ) => occ.status === 'FUTURE' && occ.dueDate >= today,
    );
    const nextInvoice = nextOccurrence
      ? this.formatMonthYear(nextOccurrence.dueDate)
      : null;

    return {
      contractId: contract.id,
      header: {
        title: contract.description ?? null,
        subtitle: `Parcelamento no Cartao ${contract.wallet?.name ?? ''}`.trim(),
        installmentLabel: `${contract.installmentsCount}x de R$ ${this.formatBrlAmount(installmentAmount)}`,
        totalLabel: `R$ ${this.formatBrlAmount(contract.totalAmount)}`,
        paidCount,
        futureCount,
        progress: {
          paid: paidCount,
          total: totalCount,
          percent,
        },
      },
      contractInfo: {
        categoryName: contract.category?.name ?? null,
        createdAt: contract.createdAt
          ? new Date(contract.createdAt).toISOString()
          : null,
        billingDayLabel: `Todo dia ${Number(contract.firstDueDate.slice(8, 10))}`,
        account: {
          walletId: contract.walletId,
          walletName: contract.wallet?.name ?? null,
          closingDay: null,
          dueDay: null,
          nextInvoice,
        },
      },
      installments: mappedInstallments,
    };
  }

  async getRecurringContractDetails(
    contractId: string,
    userId: string,
  ): Promise<GetRecurringContractDetailsResponseDto> {
    const contract = await this.recurringContractRepo.findOne({
      where: { id: contractId, userId },
      include: [
        { model: CategoryModel, as: 'category' },
        { model: WalletModel, as: 'wallet' },
        { model: RecurringOccurrenceModel, as: 'occurrences' },
      ],
    });

    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }

    const occurrences = [...(contract.occurrences ?? [])].sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate),
    );

    const transactionStatusById = await this.getTransactionStatusByIds(
      occurrences.map((occ) => occ.transactionId).filter(Boolean) as string[],
      userId,
    );
    const resolvedOccurrences = occurrences.map((occ) => {
      const transactionStatus = occ.transactionId
        ? (transactionStatusById.get(occ.transactionId) ?? null)
        : null;
      const status = this.resolveOccurrenceStatus(
        occ.status,
        transactionStatus,
      );
      return {
        id: occ.id,
        dueDate: occ.dueDate,
        amount: String(occ.amount),
        status,
        transactionId: occ.transactionId ?? null,
        transactionStatus,
      };
    });
    const paidAll = resolvedOccurrences.filter((occ) => occ.status === 'PAID');

    const paidRecent = [...paidAll]
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
      .slice(0, 3)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const upcomingGenerated = this.generateUpcomingRecurringOccurrences(contract, 3);
    const nextChargeDate = upcomingGenerated[0]?.dueDate ?? null;

    const totalPaid = paidAll.reduce((sum, occ) => sum + Number(occ.amount), 0);

    return {
      contractId: contract.id,
      contract: {
        title: contract.description ?? null,
        type: 'FIXED',
        recurrenceType: 'RECURRING',
        interval: contract.installmentInterval,
        amount: String(contract.amount),
        status: contract.status,
        nextChargeDate,
      },
      recurringInfo: {
        value: String(contract.amount),
        periodicity: contract.installmentInterval,
        billingDay: Number(contract.firstDueDate.slice(8, 10)),
        account: {
          id: contract.wallet?.id ?? null,
          name: contract.wallet?.name ?? null,
        },
        category: {
          id: contract.category?.id ?? null,
          name: contract.category?.name ?? null,
        },
        createdAt: contract.createdAt
          ? new Date(contract.createdAt).toISOString()
          : null,
      },
      occurrenceHistory: {
        items: [
          ...paidRecent,
          ...upcomingGenerated.map((occ) => ({
            id: null,
            dueDate: occ.dueDate,
            amount: String(occ.amount),
            status: 'FUTURE' as const,
            transactionId: null,
            transactionStatus: null,
          })),
        ],
        paidLimit: 3,
        futureLimit: 3,
        hasMoreHistory: paidAll.length > 3,
      },
      financialSummary: {
        totalPaid: totalPaid.toFixed(2),
        activeMonths: paidAll.length,
      },
    };
  }

  async payInstallmentOccurrence(
    contractId: string,
    installmentIndex: number,
    dto: PayInstallmentOccurrenceDto,
    userId: string,
  ) {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId, userId },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }

    const occurrence = await this.occurrenceRepo.findOne({
      where: { contractId, installmentIndex },
    });
    if (!occurrence) {
      throw new NotFoundException('Occurrence not found.');
    }

    if (occurrence.transactionId) {
      throw new BadRequestException('Occurrence already paid.');
    }
    if (!contract.transactionType) {
      throw new BadRequestException(
        'Contract transactionType is required to mark occurrence as paid.',
      );
    }

    const amount = String(occurrence.amount);
    const description = contract.description
      ? `${contract.description} • Parcela ${installmentIndex}/${contract.installmentsCount}`
      : `Parcela ${installmentIndex}/${contract.installmentsCount}`;
    const depositedDate = dto.depositedDate ?? occurrence.dueDate;
    const transactionStatus =
      contract.transactionStatus ?? TransactionStatus.Posted;

    return this.sequelize.transaction(async (transaction) => {
      const created = await this.transactionRepo.create(
        {
          depositedDate,
          description,
          amount,
          transactionType: contract.transactionType,
          transactionStatus,
          userId,
          categoryId: contract.categoryId,
          walletId: contract.walletId,
        },
        { transaction },
      );

      await occurrence.update(
        {
          installmentStatus: OccurrenceStatusEnum.Posted,
          transactionId: created.id,
        },
        { transaction },
      );

      const delta = TransactionEntity.resolveBalanceDelta(
        Number(created.amount),
        created.transactionType,
      );
      await this.walletFacade.adjustWalletBalance(contract.walletId, userId, delta);

      return {
        transaction: created,
        occurrence,
      };
    });
  }

  async payRecurringOccurrence(
    contractId: string,
    dueDate: string,
    dto: PayInstallmentOccurrenceDto,
    userId: string,
  ) {
    const contract = await this.recurringContractRepo.findOne({
      where: { id: contractId, userId },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }

    const occurrence = await this.recurringOccurrenceRepo.findOne({
      where: { contractId, dueDate },
    });
    if (!occurrence) {
      throw new NotFoundException('Occurrence not found.');
    }

    if (occurrence.transactionId) {
      throw new BadRequestException('Occurrence already paid.');
    }
    if (!contract.transactionType) {
      throw new BadRequestException(
        'Contract transactionType is required to mark occurrence as paid.',
      );
    }

    const amount = String(occurrence.amount);
    const description = contract.description ?? `Recorrencia ${dueDate}`;
    const depositedDate = dto.depositedDate ?? occurrence.dueDate;
    const transactionStatus =
      contract.transactionStatus ?? TransactionStatus.Posted;

    return this.sequelize.transaction(async (transaction) => {
      const created = await this.transactionRepo.create(
        {
          depositedDate,
          description,
          amount,
          transactionType: contract.transactionType,
          transactionStatus,
          userId,
          categoryId: contract.categoryId,
          walletId: contract.walletId,
        },
        { transaction },
      );

      await occurrence.update(
        {
          status: OccurrenceStatusEnum.Posted,
          transactionId: created.id,
        },
        { transaction },
      );

      const delta = TransactionEntity.resolveBalanceDelta(
        Number(created.amount),
        created.transactionType,
      );
      await this.walletFacade.adjustWalletBalance(contract.walletId, userId, delta);

      return {
        transaction: created,
        occurrence,
      };
    });
  }

  private calculateInstallmentAmount(
    totalAmount: string,
    installmentsCount: number,
  ): string {
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

  private formatBrlAmount(value: string): string {
    return Number(value).toFixed(2).replace('.', ',');
  }

  private formatMonthYear(date: string): string {
    const parsed = parseIsoDateOnly(date);
    if (!parsed) {
      return '';
    }
    return parsed.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  private generateUpcomingRecurringOccurrences(
    contract: RecurringContractModel,
    limit: number,
  ): Array<{ dueDate: string; amount: string }> {
    const today = formatIsoDateOnly(new Date());
    const dueDateBuilder = createDueDateBuilder(
      contract.firstDueDate,
      contract.installmentInterval,
    );
    const overrideByDate = new Map(
      (contract.occurrences ?? []).map((occ) => [occ.dueDate, occ]),
    );

    const items: Array<{ dueDate: string; amount: string }> = [];
    let offset = 0;
    let guard = 0;

    while (items.length < limit && guard < 600) {
      guard += 1;
      const dueDate = formatIsoDateOnly(dueDateBuilder(offset));
      offset += 1;

      if (dueDate < contract.firstDueDate) {
        continue;
      }
      if (dueDate < today) {
        continue;
      }
      if (contract.endsAt && dueDate > contract.endsAt) {
        break;
      }

      const override = overrideByDate.get(dueDate);
      if (override) {
        if (override.status === OccurrenceStatusEnum.Posted || override.transactionId) {
          continue;
        }
        if (
          override.status === OccurrenceStatusEnum.Skipped ||
          override.status === OccurrenceStatusEnum.Cancelled
        ) {
          continue;
        }
        items.push({ dueDate, amount: String(override.amount) });
        continue;
      }

      items.push({ dueDate, amount: String(contract.amount) });
    }

    return items;
  }

  private resolveOccurrenceStatus(
    occurrenceStatus: OccurrenceStatusEnum | null | undefined,
    transactionStatus: TransactionStatus | null,
  ): 'PAID' | 'FUTURE' | 'REVERSED' | 'CANCELLED' | 'SKIPPED' {
    if (occurrenceStatus === OccurrenceStatusEnum.Posted) {
      if (transactionStatus === TransactionStatus.Reversed) {
        return 'REVERSED';
      }
      return 'PAID';
    }

    if (occurrenceStatus === OccurrenceStatusEnum.Cancelled) {
      return 'CANCELLED';
    }

    if (occurrenceStatus === OccurrenceStatusEnum.Skipped) {
      return 'SKIPPED';
    }

    return 'FUTURE';
  }

  private async getTransactionStatusByIds(
    transactionIds: string[],
    userId: string,
  ): Promise<Map<string, TransactionStatus>> {
    const uniqueIds = Array.from(new Set(transactionIds.filter(Boolean)));
    if (uniqueIds.length === 0) {
      return new Map<string, TransactionStatus>();
    }

    const transactions = await this.transactionRepo.findAll({
      where: {
        id: { [Op.in]: uniqueIds },
        userId,
      },
      attributes: ['id', 'transactionStatus'],
    });

    return new Map(
      transactions.map((transaction) => [
        transaction.id,
        transaction.transactionStatus,
      ]),
    );
  }
}
