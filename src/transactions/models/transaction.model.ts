import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { CategoryModel } from 'src/categories/models/category.model';
import { UserEntity } from 'src/users/entities/user.entity';
import { UserModel } from 'src/users/models/user.model';
import { WalletEntity } from 'src/wallets/entities/wallet.entity';
import { WalletModel } from 'src/wallets/models/wallet.model';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';
import { ulid } from 'ulid';
import { InstallmentOccurrenceModel } from 'src/Installments/models/installment-occurrence.model';

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
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: string;


  @Column({
    field: 'transaction_type',
    type: DataType.ENUM,
    values: [
      TransactionType.Income,
      TransactionType.Expense,
      TransactionType.Transfer,
    ],
    allowNull: false,
  })
  transactionType: TransactionType;

  @Column({
    field: 'transaction_status',
    type: DataType.ENUM,
    values: [TransactionStatus.Posted, TransactionStatus.Reversed],
    allowNull: false,
    defaultValue: TransactionStatus.Posted,
  })
  transactionStatus: TransactionStatus;

  @Column({
    field: 'fit_id',
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  fitId: string;

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

  @HasMany(() => InstallmentOccurrenceModel, { foreignKey: 'contractId' })
  ccurrences: InstallmentOccurrenceModel[];
}
  