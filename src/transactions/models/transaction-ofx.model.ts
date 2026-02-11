import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { TransactionModel } from './transaction.model';

@Table({
  tableName: 'transaction_ofx_details',
})
export class TransactionOfxModel extends Model<TransactionOfxModel> {
  @PrimaryKey
  @ForeignKey(() => TransactionModel)
  @Column({
    field: 'transaction_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  transactionId: string;

  @Column({
    field: 'fit_id',
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  fitId?: string | null;

  @Column({
    field: 'account_id',
    type: DataType.STRING,
    allowNull: true,
  })
  accountId?: string | null;

  @Column({
    field: 'account_type',
    type: DataType.STRING,
    allowNull: true,
  })
  accountType?: string | null;

  @Column({
    field: 'bank_id',
    type: DataType.STRING,
    allowNull: true,
  })
  bankId?: string | null;

  @Column({
    field: 'bank_name',
    type: DataType.STRING,
    allowNull: true,
  })
  bankName?: string | null;

  @Column({
    field: 'currency',
    type: DataType.STRING,
    allowNull: true,
  })
  currency?: string | null;

  @Column({
    field: 'transaction_date',
    type: DataType.DATEONLY,
    allowNull: true,
  })
  transactionDate?: string | null;

  @BelongsTo(() => TransactionModel)
  transaction?: TransactionModel;
}
