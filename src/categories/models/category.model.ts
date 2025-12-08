import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ulid } from 'ulid';
import { ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { BudgetGroupModel } from 'src/budget-groups/models/budget-group.model';
import { TransactionModel } from 'src/transactions/models/transaction.model';

@Table({
  tableName: 'categories',
})
export class CategoryModel extends Model<CategoryModel> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(26),
    defaultValue: ulid,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  icon: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: '#615fff',
  })
  color: string;

  @Column({
    field: 'user_id',
    type: DataType.STRING(26),
    allowNull: true,
  })
  userId: string;

  @ForeignKey(() => BudgetGroupModel)
  @Column({
    field: 'budget_group_id',
    type: DataType.STRING(26),
    allowNull: true,
  })
  budgetGroupId: string;

  @BelongsTo(() => BudgetGroupModel)
  budgetGroup: BudgetGroupModel;

  @HasMany(() => TransactionModel)
  transactions: TransactionModel[];
}
