import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { CategoryModel } from 'src/categories/models/category.model';
import { UserEntity } from 'src/users/entities/user.entity';
import { UserModel } from 'src/users/models/user.model';
import { WalletEntity } from 'src/wallets/entities/wallet.entity';
import { WalletModel } from 'src/wallets/models/wallet.model';
import { ulid } from 'ulid';

@Table({
  tableName: 'transactions',
})
export class TransactionModel extends Model<TransactionModel> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(26),
    defaultValue: ulid,
  })
  id: string;

  @Column({
    field: 'deposited_date',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  depositedDate: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount: number;

  @Column({
    field: 'fit_id',
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  fitId: string;

  @Column({
    field: 'is_recurring',
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  isRecurring: boolean;

  @Column({
    field: 'is_installment',
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  isInstallment: boolean;

  @Column({
    field: 'installment_number',
    type: DataType.INTEGER,
    allowNull: true,
  })
  installmentNumber: number;

  @Column({
    field: 'installment_interval',
    type: DataType.STRING,
    allowNull: true,
  })
  installmentInterval: string;

  @Column({
    field: 'installment_end_date',
    type: DataType.DATEONLY,
    allowNull: true,
  })
  installmentEndDate: string;

  @Column({
    field: 'account_id',
    type: DataType.STRING,
    allowNull: true,
  })
  accountId: string;

  @Column({
    field: 'account_type',
    type: DataType.STRING,
    allowNull: true,
  })
  accountType: string;

  @Column({
    field: 'bank_id',
    type: DataType.STRING,
    allowNull: true,
  })
  bankId: string;

  @Column({
    field: 'bank_name',
    type: DataType.STRING,
    allowNull: true,
  })
  bankName: string;

  @Column({
    field: 'currency',
    type: DataType.STRING,
    allowNull: true,
  })
  currency: string;

  @Column({
    field: 'transaction_date',
    type: DataType.DATEONLY,
    allowNull: true,
  })
  transactionDate: string;

  @Column({
    field: 'transaction_type',
    type: DataType.STRING,
    allowNull: true,
  })
  transactionType: string;

  @Column({
    field: 'transaction_status',
    type: DataType.STRING,
    allowNull: true,
  })
  @ForeignKey(() => UserModel)
  @Column({
    field: 'user_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  userId: string;

  @ForeignKey(() => CategoryModel)
  @Column({
    field: 'category_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  categoryId: string;

  @ForeignKey(() => WalletModel)
  @Column({
    field: 'wallet_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  walletId: string;

  @BelongsTo(() => UserModel)
  user: UserEntity;

  @BelongsTo(() => CategoryModel)
  category: CategoryEntity;

  @BelongsTo(() => WalletModel)
  wallet: WalletEntity;
}
