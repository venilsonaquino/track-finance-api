import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BudgetGroupModel } from './models/budget-group.model';
import { CreateBudgetGroupDto } from './dto/create-budget-group.dto';
import { UpdateBudgetGroupDto } from './dto/update-budget-group.dto';
import { Op } from 'sequelize';

@Injectable()
export class BudgetGroupsService {
  constructor(
    @InjectModel(BudgetGroupModel)
    private readonly model: typeof BudgetGroupModel,
  ) {}

  async create(createDto: CreateBudgetGroupDto) {
    try {
      return await this.model.create(createDto as any);
    } catch (error) {
      throw Error(error);
    }
  }

  async findAllByUser(userId: string) {
    return await this.model.findAll({
      where: {
        [Op.or]: [{ userId }, { userId: null }],
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


  async createMany(dtos: CreateBudgetGroupDto[]): Promise<void> {
    try {
      await this.model.bulkCreate(dtos as any[]);
    } catch (error) {
      throw Error(error);
    }
  }
}
