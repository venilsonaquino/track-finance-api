import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/sequelize';
import { TransactionModel } from './models/transaction.model';
import { TransactionEntity } from './entities/transaction.entity';
import { Op } from 'sequelize';
import { DateRangeDto } from './dto/date-range.dto';
import { groupTransactionsAsArray } from 'src/common/utils/group-transaction-by-date';
import { WalletFacade } from 'src/wallets/facades/wallet.facade';
import { TransactionMapper } from './mappers/transaction.mapper';
import { LoggerService } from 'src/config/logging/logger.service';
import { TransactionStatus } from './enums/transaction-status.enum';
import {
  MovementsMonthQueryDto,
  MovementsTimelineView,
} from './dto/movements-month-query.dto';
import { MovementsRangeQueryDto } from './dto/movements-range-query.dto';
import {
  MovementItemDto,
  MovementsMonthlyResponseDto,
  MovementSource,
} from './dto/movements-response.dto';
import { CategoryModel } from 'src/categories/models/category.model';
import { WalletModel } from 'src/wallets/models/wallet.model';
import { InstallmentOccurrenceModel } from 'src/contracts/models/installment-occurrence.model';
import { RecurringOccurrenceModel } from 'src/contracts/models/recurring-occurrence.model';
import { InstallmentContractModel } from 'src/contracts/models/installment-contract.model';
import { RecurringContractModel } from 'src/contracts/models/recurring-contract.model';
import { OccurrenceStatusEnum } from 'src/contracts/enums/installment-occurrence-status.enum';
import { ContractStatusEnum } from 'src/contracts/enums/contract-status.enum';
import { OccurrenceProjection } from 'src/contracts/occurrence-projection';
import { ContractOccurrenceDto } from 'src/contracts/dtos/contract-occorence.dto';
import { generateDueDatesInRange } from 'src/common/utils/generate-due-dates-in-range';
import { parseIsoDateOnly } from 'src/common/utils/parse-iso-date-only';
import { TransactionOfxService } from './transaction-ofx.service';
import { TransactionOfxModel } from './models/transaction-ofx.model';
import { RecurringContractRevisionModel } from 'src/contracts/models/recurring-contract-revision.model';
import {
  RecurringAmountRevision,
  resolveRecurringAmountByDate,
} from 'src/contracts/utils/resolve-recurring-amount-by-date';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(TransactionModel)
    private readonly transactionalModel: typeof TransactionModel,
    @InjectModel(InstallmentOccurrenceModel)
    private readonly installmentOccurrenceRepo: typeof InstallmentOccurrenceModel,
    @InjectModel(RecurringOccurrenceModel)
    private readonly recurringOccurrenceRepo: typeof RecurringOccurrenceModel,
    @InjectModel(RecurringContractModel)
    private readonly recurringContractRepo: typeof RecurringContractModel,
    @InjectModel(RecurringContractRevisionModel)
    private readonly recurringRevisionRepo: typeof RecurringContractRevisionModel,
    private readonly walletFacade: WalletFacade,
    private readonly logger: LoggerService,
    private readonly transactionOfxService: TransactionOfxService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    try {
      this.logger.log(
        `Creating transaction for user=${userId} wallet=${createTransactionDto.walletId} amount=${createTransactionDto.amount} affectBalance=${createTransactionDto.affectBalance}`,
        TransactionsService.name,
      );

      const transaction = new TransactionEntity({
        depositedDate: createTransactionDto.depositedDate,
        description: createTransactionDto.description,
        amount: Math.abs(+createTransactionDto.amount),
        userId: userId,
        categoryId: createTransactionDto.categoryId,
        walletId: createTransactionDto.walletId,
        transactionType: createTransactionDto.transactionType,
        transactionStatus:
          createTransactionDto.transactionStatus ?? TransactionStatus.Posted,
      });

      const ofxPayload = this.transactionOfxService.buildPayload(
        createTransactionDto,
        transaction.id,
      );

      const sequelize = this.transactionalModel.sequelize;
      const createdTransaction = sequelize
        ? await sequelize.transaction(async (tx) => {
            const created = await this.transactionalModel.create(
              transaction as any,
              { transaction: tx },
            );
            if (ofxPayload) {
              await this.transactionOfxService.createDetails(ofxPayload, tx);
            }
            return created;
          })
        : await this.transactionalModel.create(transaction as any);

      if (createTransactionDto.affectBalance) {
        this.logger.log(
          `Affecting balance for wallet=${createTransactionDto.walletId} after transaction=${createdTransaction.id}`,
          TransactionsService.name,
        );

        const delta = TransactionEntity.resolveBalanceDelta(
          +createTransactionDto.amount,
          createTransactionDto.transactionType,
        );

        await this.walletFacade.adjustWalletBalance(
          createTransactionDto.walletId,
          userId,
          delta,
        );
      }

      return createdTransaction;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      const detailMessage = error?.parent?.detail || error?.message;
      throw new InternalServerErrorException(detailMessage);
    }
  }

  async createMany(
    createTransactionDtos: CreateTransactionDto[],
    userId: string,
  ) {
    try {
      this.logger.log(
        `Creating batch of ${createTransactionDtos.length} transactions for user=${userId}`,
        TransactionsService.name,
      );

      const transactions = createTransactionDtos.map((dto) => {
        const transaction = new TransactionEntity({
          depositedDate: dto.depositedDate,
          description: dto.description,
          amount: Math.abs(+dto.amount),
          userId: userId,
          categoryId: dto.categoryId,
          walletId: dto.walletId,
          transactionType: dto.transactionType,
          transactionStatus: dto.transactionStatus ?? TransactionStatus.Posted,
        });

        return transaction;
      });

      const sequelize = this.transactionalModel.sequelize;
      const createdTransactions = sequelize
        ? await sequelize.transaction(async (tx) => {
            const created = await this.transactionalModel.bulkCreate(
              transactions as any,
              { transaction: tx },
            );

            const ofxPayloads = createTransactionDtos
              .map((dto, index) =>
                this.transactionOfxService.buildPayload(
                  dto,
                  transactions[index].id,
                ),
              )
              .filter(Boolean) as TransactionOfxModel[];

            if (ofxPayloads.length > 0) {
              await this.transactionOfxService.bulkCreateDetails(
                ofxPayloads,
                tx,
              );
            }

            return created;
          })
        : await this.transactionalModel.bulkCreate(transactions as any);

      for (const dto of createTransactionDtos) {
        if (!dto.affectBalance) {
          continue;
        }

        this.logger.log(
          `Affecting balance (batch) for wallet=${dto.walletId} amount=${dto.amount} transactionType=${dto.transactionType}`,
          TransactionsService.name,
        );

        const delta = TransactionEntity.resolveBalanceDelta(
          +dto.amount,
          dto.transactionType,
        );

        await this.walletFacade.adjustWalletBalance(
          dto.walletId,
          userId,
          delta,
        );
      }

      return createdTransactions;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      const detailMessage = error?.parent?.detail || error?.message;
      throw new InternalServerErrorException(detailMessage);
    }
  }

  async findAllAndDateRange(userId: string, query: DateRangeDto) {
    const { start_date, end_date, category_ids, wallet_ids } = query;

    const startDate = start_date;
    const endDate = end_date;

    const whereCondition: any = {
      userId,
      depositedDate: {
        [Op.between]: [startDate, endDate],
      },
    };

    if (category_ids) {
      const categoryIdsArray = category_ids.split(',');
      whereCondition.categoryId = {
        [Op.in]: categoryIdsArray,
      };
    }

    if (wallet_ids) {
      const walletIdsArray = wallet_ids.split(',');
      whereCondition.walletId = {
        [Op.in]: walletIdsArray,
      };
    }

    const transactions = await this.transactionalModel.findAll({
      where: whereCondition,
      order: [['depositedDate', 'DESC']],
      include: ['category', 'wallet', 'ofx'],
    });

    const balance = await this.walletFacade.getWalletBalance(userId);
    const transactionEntities = transactions.map((t) =>
      TransactionMapper.toEntity(t),
    );
    const income = TransactionEntity.calculateIncome(transactionEntities);
    const expense = TransactionEntity.calculateExpense(transactionEntities);
    const monthly_balance = TransactionEntity.calculateMonthlyBalance(
      income,
      expense,
    );

    const groupBydepositedDate = groupTransactionsAsArray(transactionEntities);
    return {
      records: groupBydepositedDate,
      summary: {
        current_balance: balance,
        monthly_income: income,
        monthly_expense: expense,
        monthly_balance: monthly_balance,
      },
    };
  }

  async getMonthlyMovements(
    userId: string,
    query: MovementsMonthQueryDto,
  ): Promise<MovementsMonthlyResponseDto> {
    const { start, end } = this.buildMonthRange(query.year, query.month);
    const items = await this.buildMovementsForRange(userId, start, end, {
      view: query.view,
    });

    items.sort((a, b) => b.date.localeCompare(a.date));

    return {
      period: {
        year: query.year,
        month: query.month,
        start,
        end,
      },
      items,
    };
  }

  async getRangeMovements(
    userId: string,
    query: MovementsRangeQueryDto,
  ): Promise<MovementsMonthlyResponseDto> {
    this.validateDateRange(query.start_date, query.end_date, 5);

    const items = await this.buildMovementsForRange(
      userId,
      query.start_date,
      query.end_date,
      {
        view: query.view,
        category_ids: query.category_ids,
        wallet_ids: query.wallet_ids,
      },
    );

    items.sort((a, b) => b.date.localeCompare(a.date));

    return {
      period: {
        year: Number(query.start_date.slice(0, 4)),
        month: Number(query.start_date.slice(5, 7)),
        start: query.start_date,
        end: query.end_date,
      },
      items,
    };
  }

  private buildMonthRange(year: number, month: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));
    const start = startDate.toISOString().slice(0, 10);
    const end = endDate.toISOString().slice(0, 10);
    return { start, end };
  }

  private async buildMovementsForRange(
    userId: string,
    start: string,
    end: string,
    options: {
      view?: MovementsTimelineView;
      category_ids?: string;
      wallet_ids?: string;
    },
  ): Promise<MovementItemDto[]> {
    const view = (options.view ?? 'realized').toLowerCase() as MovementsTimelineView;
    const includeRealized = view === 'realized' || view === 'all';
    const includeFuture = view === 'future' || view === 'all';

    const categoryIds = this.parseIds(options.category_ids);
    const walletIds = this.parseIds(options.wallet_ids);

    const items: MovementItemDto[] = [];

    if (includeRealized) {
      const contractWhere: any = { userId };
      if (categoryIds) {
        contractWhere.categoryId = { [Op.in]: categoryIds };
      }
      if (walletIds) {
        contractWhere.walletId = { [Op.in]: walletIds };
      }

      const [installmentOccurrences, recurringOccurrences] = await Promise.all([
        this.installmentOccurrenceRepo.findAll({
          where: {
            transactionId: { [Op.ne]: null },
            dueDate: { [Op.between]: [start, end] },
          },
          include: [
            {
              model: InstallmentContractModel,
              as: 'contract',
              where: contractWhere,
              required: true,
            },
          ],
        }),
        this.recurringOccurrenceRepo.findAll({
          where: {
            transactionId: { [Op.ne]: null },
            dueDate: { [Op.between]: [start, end] },
          },
          include: [
            {
              model: RecurringContractModel,
              as: 'contract',
              where: contractWhere,
              required: true,
            },
          ],
        }),
      ]);

      const occurrenceTransactionIds = [
        ...installmentOccurrences.map((o) => o.transactionId).filter(Boolean),
        ...recurringOccurrences.map((o) => o.transactionId).filter(Boolean),
      ] as string[];

      const uniqueOccurrenceTransactionIds = Array.from(
        new Set(occurrenceTransactionIds),
      );

      const linkedTransactions =
        uniqueOccurrenceTransactionIds.length === 0
          ? []
          : await this.transactionalModel.findAll({
              where: {
                id: { [Op.in]: uniqueOccurrenceTransactionIds },
                userId,
              },
              include: [
                { model: CategoryModel, as: 'category' },
                { model: WalletModel, as: 'wallet' },
              ],
            });

      const transactionWhere: any = {
        userId,
        depositedDate: { [Op.between]: [start, end] },
      };
      if (categoryIds) {
        transactionWhere.categoryId = { [Op.in]: categoryIds };
      }
      if (walletIds) {
        transactionWhere.walletId = { [Op.in]: walletIds };
      }
      if (uniqueOccurrenceTransactionIds.length > 0) {
        transactionWhere.id = { [Op.notIn]: uniqueOccurrenceTransactionIds };
      }

      const transactions = await this.transactionalModel.findAll({
        where: transactionWhere,
        include: [
          { model: CategoryModel, as: 'category' },
          { model: WalletModel, as: 'wallet' },
        ],
      });

      const transactionById = new Map(
        linkedTransactions.map((t) => [t.id, t]),
      );

      items.push(
        ...transactions.map((t) => this.mapTransactionToMovement(t)),
        ...installmentOccurrences
          .map((occ) =>
            this.mapOccurrenceToMovement(
              occ,
              transactionById.get(occ.transactionId || ''),
              'installment',
            ),
          )
          .filter(Boolean),
        ...recurringOccurrences
          .map((occ) =>
            this.mapOccurrenceToMovement(
              occ,
              transactionById.get(occ.transactionId || ''),
              'recurring',
            ),
          )
          .filter(Boolean),
      );
    }

    if (includeFuture) {
      const startDate = parseIsoDateOnly(start) ?? new Date(`${start}T00:00:00Z`);
      const endDate = parseIsoDateOnly(end) ?? new Date(`${end}T00:00:00Z`);

      const plannedInstallmentsWhere: any = {
        transactionId: null,
        installmentStatus: {
          [Op.in]: [OccurrenceStatusEnum.Scheduled, OccurrenceStatusEnum.Paused],
        },
        dueDate: { [Op.between]: [start, end] },
      };

      const contractWhere: any = { userId };
      if (categoryIds) {
        contractWhere.categoryId = { [Op.in]: categoryIds };
      }
      if (walletIds) {
        contractWhere.walletId = { [Op.in]: walletIds };
      }

      const [plannedInstallments, recurringContracts] = await Promise.all([
        this.installmentOccurrenceRepo.findAll({
          where: plannedInstallmentsWhere,
          include: [
            {
              model: InstallmentContractModel,
              as: 'contract',
              where: contractWhere,
              required: true,
              include: [
                { model: CategoryModel, as: 'category' },
                { model: WalletModel, as: 'wallet' },
              ],
            },
          ],
        }),
        this.recurringContractRepo.findAll({
          where: { ...contractWhere, status: ContractStatusEnum.Active },
          include: [
            { model: CategoryModel, as: 'category' },
            { model: WalletModel, as: 'wallet' },
          ],
        }),
      ]);

      items.push(
        ...plannedInstallments.map((occ) =>
          this.mapPlannedInstallmentOccurrenceToMovement(occ),
        ),
      );

      const recurringContractIds = recurringContracts.map((c) => c.id);
      const recurringOverrides =
        recurringContractIds.length === 0
          ? []
          : await this.recurringOccurrenceRepo.findAll({
              where: {
                contractId: { [Op.in]: recurringContractIds },
                dueDate: { [Op.between]: [start, end] },
              },
            });
      const recurringRevisions =
        recurringContractIds.length === 0
          ? []
          : await this.recurringRevisionRepo.findAll({
              where: {
                contractId: { [Op.in]: recurringContractIds },
                effectiveFrom: { [Op.lte]: end },
              },
              order: [
                ['contractId', 'ASC'],
                ['effectiveFrom', 'ASC'],
              ],
            });

      const overridesByContract = new Map<string, RecurringOccurrenceModel[]>();
      for (const override of recurringOverrides) {
        const list = overridesByContract.get(override.contractId) ?? [];
        list.push(override);
        overridesByContract.set(override.contractId, list);
      }
      const revisionsByContract = new Map<string, RecurringAmountRevision[]>();
      for (const revision of recurringRevisions) {
        const list = revisionsByContract.get(revision.contractId) ?? [];
        list.push({
          effectiveFrom: revision.effectiveFrom,
          amount: String(revision.amount),
        });
        revisionsByContract.set(revision.contractId, list);
      }

      for (const contract of recurringContracts) {
        const dueDates = generateDueDatesInRange(
          contract.firstDueDate,
          contract.installmentInterval,
          startDate,
          endDate,
        );

        const revisions = revisionsByContract.get(contract.id) ?? [];
        const generated: ContractOccurrenceDto[] = dueDates.map((dueDate) => ({
          dueDate,
          amount: resolveRecurringAmountByDate(
            dueDate,
            String(contract.amount),
            revisions,
          ),
          status: OccurrenceStatusEnum.Scheduled,
          transactionId: null,
          source: 'generated',
        }));

        const overrides = (overridesByContract.get(contract.id) ?? []).map((o) =>
          o.get({ plain: true }),
        );

        const projected = OccurrenceProjection.project(generated, overrides);

        const planned = projected.filter(
          (occ) =>
            occ.status === OccurrenceStatusEnum.Scheduled &&
            !occ.transactionId,
        );

        items.push(
          ...planned.map((occ) =>
            this.mapPlannedRecurringOccurrenceToMovement(contract, occ),
          ),
        );
      }
    }

    return items;
  }

  private parseIds(value?: string): string[] | null {
    if (!value) return null;
    const items = value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    return items.length > 0 ? items : null;
  }

  private validateDateRange(start: string, end: string, maxYears: number) {
    const startDate = parseIsoDateOnly(start);
    const endDate = parseIsoDateOnly(end);
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'Invalid date range. Expected format: YYYY-MM-DD.',
      );
    }

    if (startDate.getTime() > endDate.getTime()) {
      throw new BadRequestException(
        'Invalid date range. start_date must be before or equal to end_date.',
      );
    }

    const maxEnd = new Date(startDate);
    maxEnd.setUTCFullYear(maxEnd.getUTCFullYear() + maxYears);

    if (endDate.getTime() > maxEnd.getTime()) {
      throw new BadRequestException(
        `Invalid date range. Maximum range is ${maxYears} years.`,
      );
    }
  }

  private mapTransactionToMovement(
    transaction: TransactionModel,
  ): MovementItemDto {
    return {
      id: transaction.id,
      transactionId: transaction.id,
      date: transaction.depositedDate,
      description: transaction.description,
      amount: Number(transaction.amount),
      transactionType: transaction.transactionType,
      transactionStatus: transaction.transactionStatus,
      source: 'transaction',
      category: transaction.category
        ? { id: transaction.category.id, name: transaction.category.name }
        : undefined,
      wallet: transaction.wallet
        ? { id: transaction.wallet.id, name: transaction.wallet.name }
        : undefined,
      actions: this.resolveMovementActions({
        source: 'transaction',
        occurrenceStatus: null,
        transactionStatus: transaction.transactionStatus,
        hasContract: false,
      }),
    };
  }

  private mapOccurrenceToMovement(
    occurrence: InstallmentOccurrenceModel | RecurringOccurrenceModel,
    transaction: TransactionModel | undefined,
    source: MovementSource,
  ): MovementItemDto | null {
    if (!transaction) {
      return null;
    }

    const rawStatus =
      source === 'installment'
        ? (occurrence as InstallmentOccurrenceModel).installmentStatus
        : (occurrence as RecurringOccurrenceModel).status;
    const occurrenceStatus = this.resolveOccurrenceStatus(rawStatus);

    return {
      id: occurrence.id,
      transactionId: transaction.id,
      date: occurrence.dueDate,
      description: transaction.description,
      amount: Number(transaction.amount),
      transactionType: transaction.transactionType,
      transactionStatus: transaction.transactionStatus,
      source,
      category: transaction.category
        ? { id: transaction.category.id, name: transaction.category.name }
        : undefined,
      wallet: transaction.wallet
        ? { id: transaction.wallet.id, name: transaction.wallet.name }
        : undefined,
      contractId: (occurrence as any).contractId,
      occurrenceId: occurrence.id,
      installmentIndex: (occurrence as any).installmentIndex,
      dueDate: occurrence.dueDate,
      contractType: source === 'installment' ? 'INSTALLMENT' : 'RECURRING',
      occurrenceStatus,
      actions: this.resolveMovementActions({
        source,
        occurrenceStatus,
        transactionStatus: transaction.transactionStatus,
        hasContract: true,
      }),
    };
  }

  private mapPlannedInstallmentOccurrenceToMovement(
    occurrence: InstallmentOccurrenceModel,
  ): MovementItemDto {
    const contract = occurrence.contract as InstallmentContractModel | undefined;
    const description = contract?.description
      ? `${contract.description} • Parcela ${occurrence.installmentIndex}/${contract.installmentsCount}`
      : `Parcela ${occurrence.installmentIndex}/${contract?.installmentsCount ?? ''}`.trim();

    const occurrenceStatus = this.resolveOccurrenceStatus(
      occurrence.installmentStatus,
    );

    return {
      id: occurrence.id,
      transactionId: null,
      date: occurrence.dueDate,
      description,
      amount: Number(occurrence.amount),
      transactionType: contract?.transactionType ?? null,
      transactionStatus: null,
      source: 'installment',
      category: contract?.category
        ? { id: contract.category.id, name: contract.category.name }
        : undefined,
      wallet: contract?.wallet
        ? { id: contract.wallet.id, name: contract.wallet.name }
        : undefined,
      contractId: occurrence.contractId,
      occurrenceId: occurrence.id,
      installmentIndex: occurrence.installmentIndex,
      dueDate: occurrence.dueDate,
      contractType: 'INSTALLMENT',
      occurrenceStatus,
      actions: this.resolveMovementActions({
        source: 'installment',
        occurrenceStatus,
        transactionStatus: null,
        hasContract: true,
      }),
    };
  }

  private mapPlannedRecurringOccurrenceToMovement(
    contract: RecurringContractModel,
    occurrence: ContractOccurrenceDto,
  ): MovementItemDto {
    const description =
      contract.description ?? `Recorrencia ${occurrence.dueDate}`;

    const occurrenceStatus = this.resolveOccurrenceStatus(
      occurrence.status,
    );

    return {
      id: `recurring:${contract.id}:${occurrence.dueDate}`,
      transactionId: occurrence.transactionId ?? null,
      date: occurrence.dueDate,
      description,
      amount: Number(occurrence.amount),
      transactionType: contract.transactionType ?? null,
      transactionStatus: null,
      source: 'recurring',
      category: contract.category
        ? { id: contract.category.id, name: contract.category.name }
        : undefined,
      wallet: contract.wallet
        ? { id: contract.wallet.id, name: contract.wallet.name }
        : undefined,
      contractId: contract.id,
      dueDate: occurrence.dueDate,
      contractType: 'RECURRING',
      occurrenceStatus,
      actions: this.resolveMovementActions({
        source: 'recurring',
        occurrenceStatus,
        transactionStatus: null,
        hasContract: true,
      }),
    };
  }

  private resolveOccurrenceStatus(
    occurrenceStatus: OccurrenceStatusEnum | null | undefined,
  ): OccurrenceStatusEnum {
    return occurrenceStatus ?? OccurrenceStatusEnum.Scheduled;
  }

  private resolveMovementActions(params: {
    source: MovementSource;
    occurrenceStatus: OccurrenceStatusEnum | null;
    transactionStatus?: TransactionStatus | null;
    hasContract: boolean;
  }) {
    const isFuture = params.occurrenceStatus === OccurrenceStatusEnum.Scheduled;
    const isPosted = params.occurrenceStatus === OccurrenceStatusEnum.Posted;
    const isRecurring = params.source === 'recurring';
    const isContractOccurrence =
      params.hasContract &&
      (params.source === 'installment' || params.source === 'recurring');

    return {
      canMarkAsPaid: isContractOccurrence && isFuture,
      canReverse:
        !!params.transactionStatus &&
        params.transactionStatus === TransactionStatus.Posted &&
        (params.hasContract ? isPosted : true),
      canEditDueDate: false,
      canAdjustAmount: isContractOccurrence && isFuture,
      canSkip: params.hasContract && isRecurring && isFuture,
      canViewContract: params.hasContract,
    };
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.transactionalModel.findOne({
      where: { id, userId },
      include: ['user', 'category', 'ofx'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    userId: string,
  ) {
    const existingTransaction = await this.transactionalModel.findOne({
      where: { id, userId },
    });

    if (!existingTransaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    const [affectedCount, updated] = await this.transactionalModel.update(
      {
        depositedDate: updateTransactionDto.depositedDate,
        description: updateTransactionDto.description,
        categoryId: updateTransactionDto.categoryId,
        walletId: updateTransactionDto.walletId,
      },
      {
        where: { id, userId },
        returning: true,
      },
    );

    if (affectedCount === 0 || updated.length === 0) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    const walletChanged = existingTransaction.walletId !== updateTransactionDto.walletId;
    const shouldMoveBalance =
      walletChanged &&
      existingTransaction.transactionStatus === TransactionStatus.Posted;

    if (shouldMoveBalance) {
      const delta = TransactionEntity.resolveBalanceDelta(
        Number(existingTransaction.amount),
        existingTransaction.transactionType,
      );

      await this.walletFacade.adjustWalletBalance(
        existingTransaction.walletId,
        userId,
        -delta,
      );
      await this.walletFacade.adjustWalletBalance(
        updateTransactionDto.walletId,
        userId,
        delta,
      );
    }

    return updated[0];
  }

  async reverse(id: string, userId: string) {
    const transaction = await this.transactionalModel.findOne({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    if (transaction.transactionStatus === TransactionStatus.Reversed) {
      throw new BadRequestException(
        `Transaction with id ${id} is already reversed`,
      );
    }

    const [affectedCount, updated] = await this.transactionalModel.update(
      { transactionStatus: TransactionStatus.Reversed },
      {
        where: { id, userId },
        returning: true,
      },
    );

    if (affectedCount === 0 || updated.length === 0) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    const reverseDelta =
      -TransactionEntity.resolveBalanceDelta(
        Number(transaction.amount),
        transaction.transactionType,
      );

    await this.walletFacade.adjustWalletBalance(
      transaction.walletId,
      userId,
      reverseDelta,
    );

    return updated[0];
  }

  async remove(id: string, userId: string) {
    const deletedCount = await this.transactionalModel.destroy({
      where: { id, userId },
    });

    if (deletedCount === 0) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    return;
  }

  async getTransactionsForSuggestions(
    uniqueDescriptions: string[],
    userId: string,
  ) {
    const transactions = await this.transactionalModel.findAll({
      where: {
        description: {
          [Op.in]: uniqueDescriptions,
        },
        userId: userId,
      },
      include: ['category', 'wallet', 'ofx'],
      order: [['created_at', 'DESC']],
    });

    const transactionEntities = transactions.map((transaction) =>
      TransactionMapper.toEntity(transaction),
    );
    return transactionEntities;
  }

  async getByFitIds(
    fitIds: string[],
    userId: string,
  ): Promise<TransactionEntity[]> {
    try {
      const cleanFitIds = (fitIds || []).filter(
        (fitId) => !!fitId && typeof fitId === 'string',
      );
      if (cleanFitIds.length === 0) {
        return [];
      }

      // Busca por transações que possuem fitId e o userId correspondente
      const transactionsModel = await this.transactionalModel.findAll({
        where: {
          userId: userId,
        },
        include: [
          'category',
          'wallet',
          {
            model: TransactionOfxModel,
            as: 'ofx',
            where: { fitId: cleanFitIds },
            required: true,
          },
        ],
      });

      const transactions = transactionsModel.map((t) =>
        TransactionMapper.toEntity(t),
      );

      return transactions;
    } catch (error: any) {  
      console.error('Error fetching transactions by fitIds: ', error);
      const detailMessage = error?.parent?.detail || error?.message;
      throw new InternalServerErrorException(detailMessage);
    }
  }

}
