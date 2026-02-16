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
import { TransactionType } from 'src/transactions/enums/transaction-type.enum';
import { TransactionEntity } from 'src/transactions/entities/transaction.entity';
import { GetInstallmentContractDetailsResponseDto } from './dtos/get-installment-contract-details-response.dto';
import { GetRecurringContractDetailsResponseDto } from './dtos/get-recurring-contract-details-response.dto';
import { createDueDateBuilder } from 'src/common/utils/create-due-date-builder';
import { RecurringContractRevisionModel } from './models/recurring-contract-revision.model';
import {
  RecurringAmountRevision,
  resolveRecurringAmountByDate,
} from './utils/resolve-recurring-amount-by-date';
import { WalletFinancialType } from 'src/wallets/enums/wallet-financial-type.enum';
import { CardStatementModel } from './models/card-statement.model';
import { CardStatementStatusEnum } from './enums/card-statement-status.enum';
import { PayCardStatementDto } from './dtos/pay-card-statement.dto';

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
    @InjectModel(RecurringContractRevisionModel)
    private readonly recurringRevisionRepo: typeof RecurringContractRevisionModel,
    @InjectModel(CardStatementModel)
    private readonly cardStatementRepo: typeof CardStatementModel,
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
    if (wallet.financialType !== WalletFinancialType.CreditCard) {
      throw new BadRequestException(
        'Installment contracts are only allowed for CREDIT_CARD wallets.',
      );
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
    if (wallet.financialType !== WalletFinancialType.CreditCard) {
      throw new BadRequestException(
        'Recurring contracts are only allowed for CREDIT_CARD wallets.',
      );
    }
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found for user.');
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
        },
        { transaction },
      );

      await this.recurringRevisionRepo.create(
        {
          contractId: contract.id,
          effectiveFrom: contract.firstDueDate,
          amount: contract.amount,
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
        status: {
          [Op.in]: [ContractStatusEnum.Active, ContractStatusEnum.Paused],
        },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found.');

    const dueDates = generateDueDatesInRange(
      contract.firstDueDate,
      contract.installmentInterval,
      fromDate,
      toDate,
    );

    const revisions = await this.listContractRevisionsUntil(
      contract.id,
      formatIsoDateOnly(toDate),
    );

    const generated: ContractOccurrenceDto[] = dueDates.map((dueDate) => ({
      dueDate,
      amount: this.resolveContractAmountAtDueDate(
        dueDate,
        String(contract.amount),
        revisions,
      ),
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

    const revisions = await this.listContractRevisionsUntil(contract.id, dueDate);
    const defaultAmount = this.resolveContractAmountAtDueDate(
      dueDate,
      String(contract.amount),
      revisions,
    );
    const existingOccurrence = await this.recurringOccurrenceRepo.findOne({
      where: { contractId: contract.id, dueDate },
    });
    const applyToFuture =
      dto.applyToFuture === true || (dto.applyToFuture as any) === 'true';
    const isLegacySkipRequest =
      dto.amount === undefined &&
      dto.status === undefined &&
      dto.transactionId === undefined &&
      !applyToFuture;
    const editsCurrentOccurrence =
      isLegacySkipRequest ||
      dto.status !== undefined ||
      dto.transactionId !== undefined ||
      (dto.amount !== undefined && !applyToFuture);

    if (
      editsCurrentOccurrence &&
      (existingOccurrence?.status === OccurrenceStatusEnum.Posted ||
        !!existingOccurrence?.transactionId)
    ) {
      throw new BadRequestException(
        'Occurrence already paid and cannot be edited.',
      );
    }

    if (applyToFuture && dto.amount === undefined) {
      throw new BadRequestException(
        'amount is required when applyToFuture is true.',
      );
    }

    if (applyToFuture) {
      await this.sequelize.transaction(async (transaction) => {
        const existingRevision = await this.recurringRevisionRepo.findOne({
          where: { contractId: contract.id, effectiveFrom: dueDate },
          transaction,
        });

        if (existingRevision) {
          await existingRevision.update({ amount: dto.amount! }, { transaction });
        } else {
          await this.recurringRevisionRepo.create(
            {
              contractId: contract.id,
              effectiveFrom: dueDate,
              amount: dto.amount!,
            },
            { transaction },
          );
        }

        // Existing future scheduled occurrences should reflect the new default value.
        await this.recurringOccurrenceRepo.update(
          { amount: dto.amount! },
          {
            where: {
              contractId: contract.id,
              dueDate: { [Op.gte]: dueDate },
              status: OccurrenceStatusEnum.Scheduled,
              transactionId: null,
            },
            transaction,
          },
        );
      });
    }

    const resolvedStatus = isLegacySkipRequest
      ? OccurrenceStatusEnum.Skipped
      : (dto.status ?? existingOccurrence?.status ?? OccurrenceStatusEnum.Scheduled);
    const resolvedAmount = dto.amount ?? existingOccurrence?.amount ?? defaultAmount;
    const resolvedTransactionId =
      dto.transactionId !== undefined
        ? dto.transactionId
        : existingOccurrence?.transactionId ?? null;

    if (
      resolvedStatus === OccurrenceStatusEnum.Posted &&
      !resolvedTransactionId
    ) {
      throw new BadRequestException(
        'transactionId is required when status is POSTED.',
      );
    }
    if (
      resolvedStatus !== OccurrenceStatusEnum.Posted &&
      resolvedTransactionId
    ) {
      throw new BadRequestException(
        'transactionId is only allowed when status is POSTED.',
      );
    }

    const shouldPersistOccurrence = editsCurrentOccurrence;

    const saved = shouldPersistOccurrence
      ? await this.sequelize.transaction(async (transaction) => {
          const payload = {
            contractId: contract.id,
            dueDate,
            amount: String(resolvedAmount),
            status: resolvedStatus,
            transactionId: resolvedTransactionId ?? null,
          };

          if (existingOccurrence) {
            await existingOccurrence.update(payload, { transaction });
            return existingOccurrence;
          }

          return this.recurringOccurrenceRepo.create(payload, { transaction });
        })
      : null;

    const plain = saved?.get ? saved.get({ plain: true }) : saved;

    return {
      contractId: contract.id,
      occurrence: {
        dueDate,
        amount: String(plain?.amount ?? resolvedAmount),
        status: (plain?.status ?? resolvedStatus) as OccurrenceStatusEnum,
        transactionId: plain?.transactionId ?? resolvedTransactionId ?? null,
        source: ((plain ? 'OVERRIDE' : 'GENERATED') as OccurrenceSource),
      },
    };
  }

  async updateInstallmentOccurrenceAmount(
    contractId: string,
    installmentIndex: number,
    amount: string,
    userId: string,
  ) {
    if (!Number.isInteger(installmentIndex) || installmentIndex <= 0) {
      throw new BadRequestException('installmentIndex must be a positive integer.');
    }

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
    if (
      occurrence.installmentStatus === OccurrenceStatusEnum.Posted ||
      !!occurrence.transactionId
    ) {
      throw new BadRequestException(
        'Occurrence already paid and cannot be edited.',
      );
    }

    await occurrence.update({ amount: String(amount) });

    return {
      contractId,
      occurrence: {
        id: occurrence.id,
        installmentIndex: occurrence.installmentIndex,
        dueDate: occurrence.dueDate,
        amount: String(occurrence.amount),
        status: occurrence.installmentStatus,
        transactionId: occurrence.transactionId ?? null,
      },
    };
  }

  async updateRecurringOccurrenceAmount(
    contractId: string,
    dueDate: string,
    amount: string,
    userId: string,
  ) {
    return this.upsertOccurrenceOverride(
      contractId,
      dueDate,
      { amount },
      userId,
    );
  }

  async updateRecurringOccurrenceAmountAndFuture(
    contractId: string,
    dueDate: string,
    amount: string,
    userId: string,
  ) {
    return this.upsertOccurrenceOverride(
      contractId,
      dueDate,
      { amount, applyToFuture: true },
      userId,
    );
  }

  async pauseRecurringContract(contractId: string, userId: string) {
    const contract = await this.recurringContractRepo.findOne({
      where: { id: contractId, userId },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }
    if (contract.status === ContractStatusEnum.Cancelled) {
      throw new BadRequestException('Cancelled contract cannot be paused.');
    }
    if (contract.status === ContractStatusEnum.Paused) {
      return { contract };
    }

    await this.sequelize.transaction(async (transaction) => {
      await contract.update({ status: ContractStatusEnum.Paused }, { transaction });
      const today = formatIsoDateOnly(new Date());
      await this.recurringOccurrenceRepo.update(
        { status: OccurrenceStatusEnum.Paused },
        {
          where: {
            contractId: contract.id,
            dueDate: { [Op.gte]: today },
            status: OccurrenceStatusEnum.Scheduled,
            transactionId: null,
          },
          transaction,
        },
      );
    });
    return { contract };
  }

  async resumeRecurringContract(contractId: string, userId: string) {
    const contract = await this.recurringContractRepo.findOne({
      where: { id: contractId, userId },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }
    if (contract.status === ContractStatusEnum.Cancelled) {
      throw new BadRequestException('Cancelled contract cannot be resumed.');
    }
    if (contract.status === ContractStatusEnum.Active) {
      return { contract };
    }

    await this.sequelize.transaction(async (transaction) => {
      await contract.update({ status: ContractStatusEnum.Active }, { transaction });
      const today = formatIsoDateOnly(new Date());
      await this.recurringOccurrenceRepo.update(
        { status: OccurrenceStatusEnum.Scheduled },
        {
          where: {
            contractId: contract.id,
            dueDate: { [Op.gte]: today },
            status: OccurrenceStatusEnum.Paused,
            transactionId: null,
          },
          transaction,
        },
      );
    });
    return { contract };
  }

  async closeRecurringContract(contractId: string, userId: string) {
    const contract = await this.recurringContractRepo.findOne({
      where: { id: contractId, userId },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }
    if (contract.status === ContractStatusEnum.Cancelled) {
      return { contract };
    }

    await this.sequelize.transaction(async (transaction) => {
      await contract.update(
        {
          status: ContractStatusEnum.Cancelled,
          endsAt: contract.endsAt ?? formatIsoDateOnly(new Date()),
        },
        { transaction },
      );
      const today = formatIsoDateOnly(new Date());
      await this.recurringOccurrenceRepo.update(
        { status: OccurrenceStatusEnum.Cancelled },
        {
          where: {
            contractId: contract.id,
            dueDate: { [Op.gte]: today },
            status: {
              [Op.in]: [OccurrenceStatusEnum.Scheduled, OccurrenceStatusEnum.Paused],
            },
            transactionId: null,
          },
          transaction,
        },
      );
    });

    return { contract };
  }

  async pauseInstallmentContract(contractId: string, userId: string) {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId, userId },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }
    if (
      contract.status === ContractStatusEnum.Cancelled ||
      contract.status === ContractStatusEnum.Finished
    ) {
      throw new BadRequestException('This contract cannot be paused.');
    }
    if (contract.status === ContractStatusEnum.Paused) {
      return { contract };
    }

    await this.sequelize.transaction(async (transaction) => {
      await contract.update({ status: ContractStatusEnum.Paused }, { transaction });
      const today = formatIsoDateOnly(new Date());
      await this.occurrenceRepo.update(
        { installmentStatus: OccurrenceStatusEnum.Paused },
        {
          where: {
            contractId: contract.id,
            dueDate: { [Op.gte]: today },
            installmentStatus: OccurrenceStatusEnum.Scheduled,
            transactionId: null,
          },
          transaction,
        },
      );
    });

    return { contract };
  }

  async resumeInstallmentContract(contractId: string, userId: string) {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId, userId },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }
    if (
      contract.status === ContractStatusEnum.Cancelled ||
      contract.status === ContractStatusEnum.Finished
    ) {
      throw new BadRequestException('This contract cannot be resumed.');
    }
    if (contract.status === ContractStatusEnum.Active) {
      return { contract };
    }

    await this.sequelize.transaction(async (transaction) => {
      await contract.update({ status: ContractStatusEnum.Active }, { transaction });
      const today = formatIsoDateOnly(new Date());
      await this.occurrenceRepo.update(
        { installmentStatus: OccurrenceStatusEnum.Scheduled },
        {
          where: {
            contractId: contract.id,
            dueDate: { [Op.gte]: today },
            installmentStatus: OccurrenceStatusEnum.Paused,
            transactionId: null,
          },
          transaction,
        },
      );
    });

    return { contract };
  }

  async closeInstallmentContract(contractId: string, userId: string) {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId, userId },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }
    if (
      contract.status === ContractStatusEnum.Cancelled ||
      contract.status === ContractStatusEnum.Finished
    ) {
      return { contract };
    }

    await this.sequelize.transaction(async (transaction) => {
      await contract.update({ status: ContractStatusEnum.Cancelled }, { transaction });
      const today = formatIsoDateOnly(new Date());
      await this.occurrenceRepo.update(
        { installmentStatus: OccurrenceStatusEnum.Cancelled },
        {
          where: {
            contractId: contract.id,
            dueDate: { [Op.gte]: today },
            installmentStatus: {
              [Op.in]: [OccurrenceStatusEnum.Scheduled, OccurrenceStatusEnum.Paused],
            },
            transactionId: null,
          },
          transaction,
        },
      );
    });

    return { contract };
  }

  async getCardStatementPreview(
    cardWalletId: string,
    year: number,
    month: number,
    userId: string,
  ) {
    this.validateYearMonth(year, month);
    const cardWallet = await this.ensureCreditCardWallet(cardWalletId, userId);
    const period = this.buildReferencePeriod(year, month);
    const dueDate = this.resolveCardDueDate(year, month, cardWallet.dueDay);

    const {
      installmentOccurrences,
      recurringOccurrences,
      generatedRecurringOccurrences,
    } = await this.fetchCardOccurrencesForPeriod(cardWalletId, userId, period);
    const allItems = [
      ...installmentOccurrences.map((occ) => ({
        id: occ.id,
        source: 'installment' as const,
        contractId: occ.contractId,
        dueDate: occ.dueDate,
        amount: String(occ.amount),
        status: occ.installmentStatus,
      })),
      ...recurringOccurrences.map((occ) => ({
        id: occ.id,
        source: 'recurring' as const,
        contractId: occ.contractId,
        dueDate: occ.dueDate,
        amount: String(occ.amount),
        status: occ.status,
      })),
      ...generatedRecurringOccurrences.map((occ) => ({
        id: occ.id,
        source: 'recurring' as const,
        contractId: occ.contractId,
        dueDate: occ.dueDate,
        amount: String(occ.amount),
        status: occ.status,
      })),
    ].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const payableStatuses = new Set([
      OccurrenceStatusEnum.Scheduled,
      OccurrenceStatusEnum.Paused,
    ]);
    const payableItems = allItems.filter((item) => payableStatuses.has(item.status));
    const totalAmount = payableItems.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const existingStatement = await this.cardStatementRepo.findOne({
      where: { cardWalletId, referenceMonth: period.referenceMonth },
    });

    return {
      statement: {
        id: existingStatement?.id ?? null,
        cardWalletId,
        cardWalletName: cardWallet.name,
        referenceMonth: period.referenceMonth,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        dueDate,
        status: existingStatement?.status ?? CardStatementStatusEnum.Open,
        totalAmount: totalAmount.toFixed(2),
        paymentWalletId:
          existingStatement?.paymentWalletId ??
          cardWallet.paymentAccountWalletId ??
          null,
        paymentTransactionId: existingStatement?.paymentTransactionId ?? null,
      },
      items: allItems,
    };
  }

  async payCardStatement(
    cardWalletId: string,
    year: number,
    month: number,
    dto: PayCardStatementDto,
    userId: string,
  ) {
    this.validateYearMonth(year, month);
    const cardWallet = await this.ensureCreditCardWallet(cardWalletId, userId);
    const period = this.buildReferencePeriod(year, month);
    const dueDate = this.resolveCardDueDate(year, month, cardWallet.dueDay);

    const {
      installmentOccurrences,
      recurringOccurrences,
      generatedRecurringOccurrences,
    } = await this.fetchCardOccurrencesForPeriod(cardWalletId, userId, period);

    const payableInstallments = installmentOccurrences.filter(
      (occ) =>
        occ.installmentStatus === OccurrenceStatusEnum.Scheduled ||
        occ.installmentStatus === OccurrenceStatusEnum.Paused,
    );
    const payableRecurring = recurringOccurrences.filter(
      (occ) =>
        occ.status === OccurrenceStatusEnum.Scheduled ||
        occ.status === OccurrenceStatusEnum.Paused,
    );
    const payableGeneratedRecurring = generatedRecurringOccurrences.filter(
      (occ) =>
        occ.status === OccurrenceStatusEnum.Scheduled ||
        occ.status === OccurrenceStatusEnum.Paused,
    );

    const totalAmount =
      payableInstallments.reduce((sum, occ) => sum + Number(occ.amount), 0) +
      payableRecurring.reduce((sum, occ) => sum + Number(occ.amount), 0) +
      payableGeneratedRecurring.reduce((sum, occ) => sum + Number(occ.amount), 0);

    if (totalAmount <= 0) {
      throw new BadRequestException('There are no payable items in this statement.');
    }

    const paymentWalletId = dto.paymentWalletId ?? cardWallet.paymentAccountWalletId;
    if (!paymentWalletId) {
      throw new BadRequestException(
        'paymentWalletId is required when card has no default payment account.',
      );
    }

    const inferredCategoryId =
      payableInstallments[0]?.contract?.categoryId ??
      payableRecurring[0]?.contract?.categoryId ??
      payableGeneratedRecurring[0]?.contract?.categoryId ??
      null;
    const categoryId = dto.categoryId ?? inferredCategoryId;
    if (!categoryId) {
      throw new BadRequestException(
        'categoryId is required when it cannot be inferred from statement items.',
      );
    }
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found for user.');
    }

    const paymentWallet = await this.walletRepo.findOne({
      where: { id: paymentWalletId, userId },
    });
    if (!paymentWallet) {
      throw new NotFoundException('Payment account wallet not found.');
    }
    if (paymentWallet.financialType !== WalletFinancialType.Account) {
      throw new BadRequestException('paymentWalletId must be an ACCOUNT wallet.');
    }

    const description =
      dto.description ??
      `Pagamento fatura ${cardWallet.name} ${period.referenceMonth.slice(0, 7)}`;
    const depositedDate = dto.depositedDate;

    return this.sequelize.transaction(async (transaction) => {
      const paymentTransaction = await this.transactionRepo.create(
        {
          depositedDate,
          description,
          amount: totalAmount.toFixed(2),
          transactionType: TransactionType.Expense,
          transactionStatus: TransactionStatus.Posted,
          userId,
          categoryId,
          walletId: paymentWalletId,
          cardWalletId,
        },
        { transaction },
      );

      if (payableInstallments.length > 0) {
        await this.occurrenceRepo.update(
          { installmentStatus: OccurrenceStatusEnum.Closed, transactionId: null },
          {
            where: { id: { [Op.in]: payableInstallments.map((occ) => occ.id) } },
            transaction,
          },
        );
      }

      if (payableRecurring.length > 0) {
        await this.recurringOccurrenceRepo.update(
          { status: OccurrenceStatusEnum.Closed, transactionId: null },
          {
            where: { id: { [Op.in]: payableRecurring.map((occ) => occ.id) } },
            transaction,
          },
        );
      }

      if (payableGeneratedRecurring.length > 0) {
        await this.recurringOccurrenceRepo.bulkCreate(
          payableGeneratedRecurring.map((occ) => ({
            contractId: occ.contractId,
            dueDate: occ.dueDate,
            amount: String(occ.amount),
            status: OccurrenceStatusEnum.Closed,
            transactionId: null,
          })),
          { transaction },
        );
      }

      const existingStatement = await this.cardStatementRepo.findOne({
        where: {
          cardWalletId,
          referenceMonth: period.referenceMonth,
        },
        transaction,
      });

      const statementPayload = {
        userId,
        cardWalletId,
        referenceMonth: period.referenceMonth,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        dueDate,
        totalAmount: totalAmount.toFixed(2),
        status: CardStatementStatusEnum.Paid,
        paymentWalletId,
        paymentTransactionId: paymentTransaction.id,
        paidAt: depositedDate,
      };

      if (existingStatement) {
        await existingStatement.update(statementPayload, { transaction });
      } else {
        await this.cardStatementRepo.create(statementPayload, { transaction });
      }

      const delta = TransactionEntity.resolveBalanceDelta(
        Number(paymentTransaction.amount),
        paymentTransaction.transactionType,
      );
      await this.walletFacade.adjustWalletBalance(paymentWalletId, userId, delta);

      return {
        statement: statementPayload,
        paymentTransaction,
      };
    });
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
    const revisions = await this.listContractRevisionsUntil(contract.id);
    const currentAmount = this.resolveContractAmountAtDueDate(
      formatIsoDateOnly(new Date()),
      String(contract.amount),
      revisions,
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

    const upcomingGenerated = this.generateUpcomingRecurringOccurrences(
      contract,
      revisions,
      3,
    );
    const nextChargeDate = upcomingGenerated[0]?.dueDate ?? null;
    const today = formatIsoDateOnly(new Date());
    const currentRevision = [...revisions]
      .reverse()
      .find((revision) => revision.effectiveFrom <= today);
    const nextRevision = revisions.find((revision) => revision.effectiveFrom > today);
    const contractCreatedAt =
      (contract as any).createdAt ?? (contract as any).created_at ?? null;
    const contractUpdatedAt =
      (contract as any).updatedAt ?? (contract as any).updated_at ?? null;

    const totalPaid = paidAll.reduce((sum, occ) => sum + Number(occ.amount), 0);

    return {
      contractId: contract.id,
      contract: {
        title: contract.description ?? null,
        type: 'FIXED',
        recurrenceType: 'RECURRING',
        interval: contract.installmentInterval,
        amount: currentAmount,
        status: contract.status,
        nextChargeDate,
        ends_at: contract.endsAt ?? null,
        created_at: contractCreatedAt
          ? new Date(contractCreatedAt).toISOString()
          : null,
        updated_at: contractUpdatedAt
          ? new Date(contractUpdatedAt).toISOString()
          : null,
      },
      recurringInfo: {
        value: currentAmount,
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
        valueChangedAt: currentRevision?.effectiveFrom ?? contract.firstDueDate,
        nextValueChange: nextRevision
          ? {
              effectiveFrom: nextRevision.effectiveFrom,
              amount: String(nextRevision.amount),
            }
          : null,
        createdAt: contractCreatedAt
          ? new Date(contractCreatedAt).toISOString()
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
    if (contract.status !== ContractStatusEnum.Active) {
      throw new BadRequestException('Only active contracts can be paid.');
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
    if (
      occurrence.installmentStatus === OccurrenceStatusEnum.Cancelled ||
      occurrence.installmentStatus === OccurrenceStatusEnum.Skipped ||
      occurrence.installmentStatus === OccurrenceStatusEnum.Paused ||
      occurrence.installmentStatus === OccurrenceStatusEnum.Closed
    ) {
      throw new BadRequestException('Occurrence is not payable.');
    }
    const amount = String(occurrence.amount);
    const description = contract.description
      ? `${contract.description} • Parcela ${installmentIndex}/${contract.installmentsCount}`
      : `Parcela ${installmentIndex}/${contract.installmentsCount}`;
    const depositedDate = dto.depositedDate ?? occurrence.dueDate;
    const transactionStatus = TransactionStatus.Posted;

    return this.sequelize.transaction(async (transaction) => {
      const created = await this.transactionRepo.create(
        {
          depositedDate,
          description,
          amount,
          transactionType: TransactionType.Expense,
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
      const contractWallet = await this.walletRepo.findOne({
        where: { id: contract.walletId, userId },
      });
      if (
        contractWallet &&
        contractWallet.financialType === WalletFinancialType.Account
      ) {
        await this.walletFacade.adjustWalletBalance(contract.walletId, userId, delta);
      }

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
    const dueDateObj = parseIsoDateOnly(dueDate);
    if (!dueDateObj) {
      throw new BadRequestException('Invalid dueDate. Use YYYY-MM-DD.');
    }

    const contract = await this.recurringContractRepo.findOne({
      where: { id: contractId, userId },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found.');
    }
    if (contract.status !== ContractStatusEnum.Active) {
      throw new BadRequestException('Only active contracts can be paid.');
    }
    if (
      !isDueDateOnSchedule(
        contract.firstDueDate,
        contract.installmentInterval,
        dueDate,
      )
    ) {
      throw new BadRequestException(
        'dueDate is not valid for this contract schedule.',
      );
    }

    const existingOccurrence = await this.recurringOccurrenceRepo.findOne({
      where: { contractId, dueDate },
    });

    if (
      existingOccurrence?.status === OccurrenceStatusEnum.Posted ||
      existingOccurrence?.transactionId
    ) {
      throw new BadRequestException('Occurrence already paid.');
    }
    if (
      existingOccurrence?.status === OccurrenceStatusEnum.Cancelled ||
      existingOccurrence?.status === OccurrenceStatusEnum.Skipped ||
      existingOccurrence?.status === OccurrenceStatusEnum.Paused ||
      existingOccurrence?.status === OccurrenceStatusEnum.Closed
    ) {
      throw new BadRequestException('Occurrence is not payable.');
    }
    const revisions = await this.listContractRevisionsUntil(contract.id, dueDate);
    const generatedAmount = this.resolveContractAmountAtDueDate(
      dueDate,
      String(contract.amount),
      revisions,
    );
    const amount = String(existingOccurrence?.amount ?? generatedAmount);
    const description = contract.description ?? `Recorrencia ${dueDate}`;
    const depositedDate = dto.depositedDate ?? dueDate;
    const transactionStatus = TransactionStatus.Posted;

    return this.sequelize.transaction(async (transaction) => {
      const created = await this.transactionRepo.create(
        {
          depositedDate,
          description,
          amount,
          transactionType: TransactionType.Expense,
          transactionStatus,
          userId,
          categoryId: contract.categoryId,
          walletId: contract.walletId,
        },
        { transaction },
      );

      const occurrence = existingOccurrence
        ? await existingOccurrence.update(
            {
              amount,
              status: OccurrenceStatusEnum.Posted,
              transactionId: created.id,
            },
            { transaction },
          )
        : await this.recurringOccurrenceRepo.create(
            {
              contractId,
              dueDate,
              amount,
              status: OccurrenceStatusEnum.Posted,
              transactionId: created.id,
            },
            { transaction },
          );

      const delta = TransactionEntity.resolveBalanceDelta(
        Number(created.amount),
        created.transactionType,
      );
      const contractWallet = await this.walletRepo.findOne({
        where: { id: contract.walletId, userId },
      });
      if (
        contractWallet &&
        contractWallet.financialType === WalletFinancialType.Account
      ) {
        await this.walletFacade.adjustWalletBalance(contract.walletId, userId, delta);
      }

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

  private validateYearMonth(year: number, month: number) {
    if (!Number.isInteger(year) || year < 1970 || year > 9999) {
      throw new BadRequestException('Invalid year.');
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException('Invalid month.');
    }
  }

  private buildReferencePeriod(year: number, month: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));
    return {
      referenceMonth: startDate.toISOString().slice(0, 10),
      periodStart: startDate.toISOString().slice(0, 10),
      periodEnd: endDate.toISOString().slice(0, 10),
    };
  }

  private resolveCardDueDate(
    year: number,
    month: number,
    dueDay: number | null | undefined,
  ): string {
    const resolvedDueDay = dueDay ?? 1;
    const monthLastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const safeDay = Math.min(Math.max(resolvedDueDay, 1), monthLastDay);
    return new Date(Date.UTC(year, month - 1, safeDay)).toISOString().slice(0, 10);
  }

  private async ensureCreditCardWallet(cardWalletId: string, userId: string) {
    const wallet = await this.walletRepo.findOne({
      where: { id: cardWalletId, userId },
    });
    if (!wallet) {
      throw new NotFoundException('Card wallet not found.');
    }
    if (wallet.financialType !== WalletFinancialType.CreditCard) {
      throw new BadRequestException('Wallet is not CREDIT_CARD.');
    }
    return wallet;
  }

  private async fetchCardOccurrencesForPeriod(
    cardWalletId: string,
    userId: string,
    period: { periodStart: string; periodEnd: string },
  ) {
    const [installmentOccurrences, recurringOccurrences, recurringContracts] =
      await Promise.all([
        this.occurrenceRepo.findAll({
          where: {
            dueDate: { [Op.between]: [period.periodStart, period.periodEnd] },
            installmentStatus: {
              [Op.in]: [
                OccurrenceStatusEnum.Scheduled,
                OccurrenceStatusEnum.Paused,
                OccurrenceStatusEnum.Closed,
              ],
            },
            transactionId: null,
          },
          include: [
            {
              model: InstallmentContractModel,
              as: 'contract',
              where: { walletId: cardWalletId, userId },
              required: true,
            },
          ],
        }),
        this.recurringOccurrenceRepo.findAll({
          where: {
            dueDate: { [Op.between]: [period.periodStart, period.periodEnd] },
            status: {
              [Op.in]: [
                OccurrenceStatusEnum.Scheduled,
                OccurrenceStatusEnum.Paused,
                OccurrenceStatusEnum.Closed,
              ],
            },
            transactionId: null,
          },
          include: [
            {
              model: RecurringContractModel,
              as: 'contract',
              where: { walletId: cardWalletId, userId },
              required: true,
            },
          ],
        }),
        this.recurringContractRepo.findAll({
          where: {
            walletId: cardWalletId,
            userId,
            status: ContractStatusEnum.Active,
          },
        }),
      ]);

    const fromDate = parseIsoDateOnly(period.periodStart);
    const toDate = parseIsoDateOnly(period.periodEnd);
    const generatedRecurringOccurrences: Array<{
      id: null;
      contractId: string;
      dueDate: string;
      amount: string;
      status: OccurrenceStatusEnum;
      contract: { categoryId: string };
    }> = [];

    if (fromDate && toDate && recurringContracts.length > 0) {
      const existingRecurringKeys = new Set(
        recurringOccurrences.map((occ) => `${occ.contractId}:${occ.dueDate}`),
      );

      for (const contract of recurringContracts) {
        if (contract.endsAt && contract.endsAt < period.periodStart) {
          continue;
        }

        const dueDates = generateDueDatesInRange(
          contract.firstDueDate,
          contract.installmentInterval,
          fromDate,
          toDate,
        );
        const revisions = await this.listContractRevisionsUntil(
          contract.id,
          period.periodEnd,
        );

        for (const dueDate of dueDates) {
          if (contract.endsAt && dueDate > contract.endsAt) {
            continue;
          }

          const occurrenceKey = `${contract.id}:${dueDate}`;
          if (existingRecurringKeys.has(occurrenceKey)) {
            continue;
          }

          generatedRecurringOccurrences.push({
            id: null,
            contractId: contract.id,
            dueDate,
            amount: this.resolveContractAmountAtDueDate(
              dueDate,
              String(contract.amount),
              revisions,
            ),
            status: OccurrenceStatusEnum.Scheduled,
            contract: { categoryId: contract.categoryId },
          });
        }
      }
    }

    return {
      installmentOccurrences,
      recurringOccurrences,
      generatedRecurringOccurrences,
    };
  }

  private generateUpcomingRecurringOccurrences(
    contract: RecurringContractModel,
    revisions: RecurringAmountRevision[],
    limit: number,
  ): Array<{ dueDate: string; amount: string }> {
    if (contract.status !== ContractStatusEnum.Active) {
      return [];
    }

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
          override.status === OccurrenceStatusEnum.Paused ||
          override.status === OccurrenceStatusEnum.Closed ||
          override.status === OccurrenceStatusEnum.Skipped ||
          override.status === OccurrenceStatusEnum.Cancelled
        ) {
          continue;
        }
        items.push({ dueDate, amount: String(override.amount) });
        continue;
      }

      items.push({
        dueDate,
        amount: this.resolveContractAmountAtDueDate(
          dueDate,
          String(contract.amount),
          revisions,
        ),
      });
    }

    return items;
  }

  private async listContractRevisionsUntil(
    contractId: string,
    untilDueDate?: string,
  ): Promise<RecurringAmountRevision[]> {
    const where: any = { contractId };
    if (untilDueDate) {
      where.effectiveFrom = { [Op.lte]: untilDueDate };
    }

    const models = await this.recurringRevisionRepo.findAll({
      where,
      order: [['effectiveFrom', 'ASC']],
    });

    return models.map((revision) => ({
      effectiveFrom: revision.effectiveFrom,
      amount: String(revision.amount),
    }));
  }

  private resolveContractAmountAtDueDate(
    dueDate: string,
    defaultAmount: string,
    revisions: RecurringAmountRevision[],
  ): string {
    return resolveRecurringAmountByDate(dueDate, defaultAmount, revisions);
  }

  private resolveOccurrenceStatus(
    occurrenceStatus: OccurrenceStatusEnum | null | undefined,
    transactionStatus: TransactionStatus | null,
  ): 'PAID' | 'FUTURE' | 'REVERSED' | 'CANCELLED' | 'SKIPPED' | 'PAUSED' | 'CLOSED' {
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

    if (occurrenceStatus === OccurrenceStatusEnum.Paused) {
      return 'PAUSED';
    }

    if (occurrenceStatus === OccurrenceStatusEnum.Closed) {
      return 'CLOSED';
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
