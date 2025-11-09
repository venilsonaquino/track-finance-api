import { Inject, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BudgetGroupModel } from './models/budget-group.model';
import { CreateBudgetGroupDto } from './dto/create-budget-group.dto';
import { UpdateBudgetGroupDto } from './dto/update-budget-group.dto';
import { Op, Sequelize } from 'sequelize';
import { LoggerService } from 'src/config/logging/logger.service';
import { CategoryModel } from 'src/categories/models/category.model';
import { SyncAssignmentsDto } from './dto/sync-assignments.dto';

@Injectable()
export class BudgetGroupsService {
  constructor(
    @InjectModel(BudgetGroupModel)
    private readonly model: typeof BudgetGroupModel,
    @InjectModel(CategoryModel)
    private readonly categoryModel: typeof CategoryModel,
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
      order: [['created_at', 'DESC']],
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
    syncAssignmentsDto: SyncAssignmentsDto,
    userId: string,
  ): Promise<void> {
    try {
      await this.sequelize.transaction(async (tx) => {
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
      throw new InternalServerErrorException('Error syncing category assignments');
    }
  }
}
