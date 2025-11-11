import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ulid } from 'ulid';
import { HasMany } from 'sequelize-typescript';
import { CategoryModel } from 'src/categories/models/category.model';
import { BudgetGroupKind } from '../enum/BudgetGroupKind';

@Table({
  tableName: 'budget_groups',
})
export class BudgetGroupModel extends Model<BudgetGroupModel> {
  @PrimaryKey
  @Column({
    type: 'VARCHAR(26)',
    defaultValue: ulid,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.ENUM,
    values: [BudgetGroupKind.COMPUTED, BudgetGroupKind.EDITABLE],
    defaultValue: BudgetGroupKind.EDITABLE,
  })
  kind: BudgetGroupKind;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: '#0084d1',
  })
  color: string;

  @Column({
    field: 'footer_label',
    type: DataType.STRING,
    allowNull: true,
  })
  footerLabel: string;

  @Column({
    field: 'is_system_default',
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isSystemDefault: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  position: number;

  @Column({
    field: 'user_id',
    type: 'VARCHAR(26)',
    allowNull: true,
  })
  userId: string;

  @HasMany(() => CategoryModel)
  categories: CategoryModel[];
}
