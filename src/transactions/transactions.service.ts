import {
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
import { MovementsMonthQueryDto } from './dto/movements-month-query.dto';
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

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(TransactionModel)
    private readonly transactionalModel: typeof TransactionModel,
    @InjectModel(InstallmentOccurrenceModel)
    private readonly installmentOccurrenceRepo: typeof InstallmentOccurrenceModel,
    @InjectModel(RecurringOccurrenceModel)
    private readonly recurringOccurrenceRepo: typeof RecurringOccurrenceModel,
    private readonly walletFacade: WalletFacade,
    private readonly logger: LoggerService,
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
        amount: +createTransactionDto.amount,
        userId: userId,
        categoryId: createTransactionDto.categoryId,
        fitId: createTransactionDto.fitId,
        walletId: createTransactionDto.walletId,
        transactionType: createTransactionDto.transactionType,
        transactionStatus:
          createTransactionDto.transactionStatus ?? TransactionStatus.Posted,
        accountId: createTransactionDto.accountId,
        accountType: createTransactionDto.accountType,
        bankId: createTransactionDto.bankId,
        bankName: createTransactionDto.bankName,
        currency: createTransactionDto.currency,
        // transactionDate: createTransactionDto.transactionDate,
      });

      const createdTransaction = await this.transactionalModel.create(
        transaction as any,
      );

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
          amount: +dto.amount,
          userId: userId,
          categoryId: dto.categoryId,
          fitId: dto.fitId,
          walletId: dto.walletId,
          transactionType: dto.transactionType,
          transactionStatus: dto.transactionStatus ?? TransactionStatus.Posted,
          accountId: dto.accountId,
          accountType: dto.accountType,
          bankId: dto.bankId,
          bankName: dto.bankName,
          currency: dto.currency,
        });

        return transaction;
      });

      const createdTransactions = await this.transactionalModel.bulkCreate(
        transactions as any,
      );

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
      include: ['category', 'wallet'],
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
            where: { userId },
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
            where: { userId },
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
            where: { id: { [Op.in]: uniqueOccurrenceTransactionIds }, userId },
            include: [
              { model: CategoryModel, as: 'category' },
              { model: WalletModel, as: 'wallet' },
            ],
          });

    const transactionWhere: any = {
      userId,
      depositedDate: { [Op.between]: [start, end] },
    };
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

    const items: MovementItemDto[] = [
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
    ] as MovementItemDto[];

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

  private buildMonthRange(year: number, month: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));
    const start = startDate.toISOString().slice(0, 10);
    const end = endDate.toISOString().slice(0, 10);
    return { start, end };
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
    };
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.transactionalModel.findOne({
      where: { id, userId },
      include: ['user', 'category'],
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
    const transaction = new TransactionEntity({
      depositedDate: updateTransactionDto.depositedDate,
      description: updateTransactionDto.description,
      amount: +updateTransactionDto.amount,
      userId: userId,
      categoryId: updateTransactionDto.categoryId,
      fitId: updateTransactionDto.fitId,
      walletId: updateTransactionDto.walletId,
      transactionType: updateTransactionDto.transactionType,
      transactionStatus: updateTransactionDto.transactionStatus,
      accountId: updateTransactionDto.accountId,
      accountType: updateTransactionDto.accountType,
      bankId: updateTransactionDto.bankId,
      bankName: updateTransactionDto.bankName,
      currency: updateTransactionDto.currency,
      // transactionDate: updateTransactionDto.transactionDate,
    });

    const [affectedCount, updated] = await this.transactionalModel.update(
      transaction as any,
      {
        where: { id, userId },
        returning: true,
      },
    );

    if (affectedCount == 0 && updated.length == 0) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

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
      include: ['category', 'wallet'],
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
      // Busca por transações que possuem fitId e o userId correspondente
      const transactionsModel = await this.transactionalModel.findAll({
        where: {
          fitId: fitIds,
          userId: userId,
        },
        include: ['category', 'wallet'],
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
