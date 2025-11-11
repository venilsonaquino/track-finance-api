import { Inject, Injectable, NotFoundException, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BudgetGroupModel } from './models/budget-group.model';
import { CreateBudgetGroupDto } from './dto/create-budget-group.dto';
import { UpdateBudgetGroupDto } from './dto/update-budget-group.dto';
import { Op, Sequelize } from 'sequelize';
import { LoggerService } from 'src/config/logging/logger.service';
import { CategoryModel } from 'src/categories/models/category.model';
import { SyncCategoryAssignmentsDto } from './dto/sync-category-assignments.dto';
import { TransactionModel } from 'src/transactions/models/transaction.model';
import { 
  BudgetOverviewDto, 
  BudgetSectionComputed, 
  BudgetSectionEditable, 
  MonthlyValues, 
  createZeroYear 
} from './dto/budget-overview.dto';
import { BudgetGroupKind } from './enum/BudgetGroupKind';

@Injectable()
export class BudgetGroupsService {
  constructor(
    @InjectModel(BudgetGroupModel)
    private readonly model: typeof BudgetGroupModel,
    @InjectModel(CategoryModel)
    private readonly categoryModel: typeof CategoryModel,
    @InjectModel(TransactionModel)
    private readonly transactionModel: typeof TransactionModel,
    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) {}
  
  private readonly sequelize: Sequelize = this.model.sequelize as Sequelize;

  async create(createDto: CreateBudgetGroupDto) {
    try {
      return await this.model.create(createDto);
    } catch (error) {
      throw Error(error);
    }
  }

  async findAllByUser(userId: string) {
    return await this.model.findAll({
      where: {
        [Op.or]: [{ userId }],
      },
      include: [{ model: this.categoryModel, as: 'categories' }],
      order: [
        ['isSystemDefault', 'DESC'], // System defaults first
        [this.sequelize.literal(`CASE 
          WHEN title = 'SALDO' THEN 1 
          WHEN title = 'RECEITAS' THEN 2 
          ELSE 3 
        END`), 'ASC'], // SALDO first, then RECEITAS, then others
        ['created_at', 'DESC']
      ],
    });
  }

  async findOne(id: string, userId: string) {
    const item = await this.model.findOne({ where: { id, userId } });
    if (!item) {
      throw new NotFoundException(`Budget group with id ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateDto: UpdateBudgetGroupDto) {
    const [affectedCount, updated] = await this.model.update(updateDto, {
      where: { id, userId: updateDto.userId },
      returning: true,
    });

    if (affectedCount == 0 && updated.length == 0) {
      throw new NotFoundException(`Budget group with id ${id} not found`);
    }

    return updated[0];
  }

  async remove(id: string, userId: string) {
    const group = await this.findOne(id, userId);
    if (group.isSystemDefault) {
      throw new InternalServerErrorException('Cannot delete system budget groups');
    }
    const deletedCount = await this.model.destroy({ where: { id, userId } });
    if (deletedCount === 0) {
      throw new NotFoundException(`Budget group with id ${id} not found`);
    }
    return;
  }

  async createMany(dtos: CreateBudgetGroupDto[]) {
    try {
      var created = await this.model.bulkCreate(dtos as any[]);
      return created;
    } catch (error) {
      this.logger.error('Error creating budget groups', error);
      throw Error(error);
    }
  }

  async syncCategoryAssignments(
    syncAssignmentsDto: SyncCategoryAssignmentsDto,
    userId: string,
  ): Promise<void> {
    try {
      await this.sequelize.transaction(async (tx) => {

        const computedGroup = await this.model.findOne({ 
          where: { 
            kind: BudgetGroupKind.COMPUTED, 
            userId 
          } 
        });

        const hasComputedGroupAssignment = computedGroup && 
          syncAssignmentsDto.assignments.some(assignment => 
            assignment.budgetGroupId === computedGroup.id
          );

        if (hasComputedGroupAssignment) {
          throw new UnprocessableEntityException('Cannot assign categories to computed budget groups (SALDO)');
        }

        const categoryIds = syncAssignmentsDto.assignments.map((a) => a.categoryId);
        const categories = await this.categoryModel.findAll(
          { where: { 
              id: categoryIds, 
              [Op.or]: [{ userId }, { userId: null }] 
            }, 
            transaction: tx 
          });

          syncAssignmentsDto.assignments.forEach(assignment => {
              categories.forEach(category => {
                  if (category.id === assignment.categoryId) {
                      category.budgetGroupId = assignment.budgetGroupId;
                  }
              });
          });

          var updated = await Promise.all(categories.map(category => category.save({ transaction: tx })));
          return updated;
      });
    } catch (error) {
      this.logger.error('Error syncing category assignments', error);
      if (error instanceof NotFoundException) throw error;
      if( error instanceof UnprocessableEntityException) throw error;
      throw new InternalServerErrorException('Error syncing category assignments');
    }
  }

  async getBudgetOverview(userId: string, year: number): Promise<BudgetOverviewDto> {
    try {

      if(isNaN(year) || year < 1900 || year > 2100) throw new UnprocessableEntityException('Invalid year parameter');

      // Fetch all budget groups with their categories
      const budgetGroups = await this.model.findAll({
        where: {
          [Op.or]: [{ userId }],
        },
        include: [{ 
          model: this.categoryModel, 
          as: 'categories',
          include: [{
            model: this.transactionModel,
            as: 'transactions',
            where: {
              userId,
              depositedDate: {
                [Op.between]: [`${year}-01-01`, `${year}-12-31`]
              }
            },
            required: false
          }]
        }],
        order: [
          ['isSystemDefault', 'DESC'],
          [this.sequelize.literal(`CASE 
            WHEN title = 'SALDO' THEN 1 
            WHEN title = 'RECEITAS' THEN 2 
            ELSE 3 
          END`), 'ASC'],
          ['created_at', 'DESC']
        ],
      });

      const computedGroup = budgetGroups.find(group => group.kind === BudgetGroupKind.COMPUTED);
      const editableGroups = budgetGroups.filter(group => group.kind === BudgetGroupKind.EDITABLE);

      const sectionsComputed: BudgetSectionComputed = {
        id: computedGroup?.id,
        title: computedGroup?.title,
        kind: 'computed',
        color: computedGroup?.color,
        footerLabel: computedGroup?.footerLabel || `Total ${computedGroup?.title}`,
        rows: editableGroups.map(group => ({
          id: group.id,
          label: group.title,
          refSectionTitle: group.title
        }))
      };

      const sectionsEditable: BudgetSectionEditable[] = editableGroups.map(group => ({
        id: group.id,
        title: group.title,
        kind: 'editable',
        color: group.color,
        footerLabel: group.footerLabel || `Total ${group.title}`,
        rows: group.categories?.map(category => ({
          id: category.id,
          label: category.name,
          values: this.calculateMonthlyValues(category.transactions || [], year)
        })) || []
      }));

      return new BudgetOverviewDto({
        year,
        sectionsComputed,
        sectionsEditable
      });

    } catch (error) {
      this.logger.error('Error getting budget overview', error);
      if (error instanceof NotFoundException) throw error;
      if( error instanceof UnprocessableEntityException) throw error;
      throw new InternalServerErrorException('Error getting budget overview');
    }
  }

  private calculateMonthlyValues(transactions: any[], year: number): MonthlyValues {
    const monthlyValues = createZeroYear();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.depositedDate);
      if (transactionDate.getFullYear() === year) {
        const monthIndex = transactionDate.getMonth();
        const monthKey = monthNames[monthIndex] as keyof MonthlyValues;
        monthlyValues[monthKey] += Math.abs(transaction.amount);
      }
    });

    return monthlyValues;
  }
}
