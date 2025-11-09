import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ulid } from 'ulid';

@Table({
  tableName: 'categories',
})
export class CategoryModel extends Model<CategoryModel> {
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
    defaultValue: '#007BFF',
  })
  color: string;

  @Column({
    field: 'user_id',
    type: 'VARCHAR(26)',
    allowNull: true,
  })
  userId: string;
}
