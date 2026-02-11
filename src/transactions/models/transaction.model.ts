import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasOne,
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
import { InstallmentOccurrenceModel } from 'src/contracts/models/installment-occurrence.model';
import { TransactionOfxModel } from './transaction-ofx.model';

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

  @Column(DataType.VIRTUAL)
  get fitId(): string | null {
    return this.ofx?.fitId ?? null;
  }

  @Column(DataType.VIRTUAL)
  get accountId(): string | null {
    return this.ofx?.accountId ?? null;
  }

  @Column(DataType.VIRTUAL)
  get accountType(): string | null {
    return this.ofx?.accountType ?? null;
  }

  @Column(DataType.VIRTUAL)
  get bankId(): string | null {
    return this.ofx?.bankId ?? null;
  }

  @Column(DataType.VIRTUAL)
  get bankName(): string | null {
    return this.ofx?.bankName ?? null;
  }

  @Column(DataType.VIRTUAL)
  get currency(): string | null {
    return this.ofx?.currency ?? null;
  }

  @Column(DataType.VIRTUAL)
  get transactionDate(): string | null {
    return this.ofx?.transactionDate ?? null;
  }

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

  @HasOne(() => InstallmentOccurrenceModel, {
    foreignKey: 'transactionId',
    as: 'installmentOccurrence',
  })
  installmentOccurrence?: InstallmentOccurrenceModel;

  @HasOne(() => TransactionOfxModel, {
    foreignKey: 'transactionId',
    as: 'ofx',
  })
  ofx?: TransactionOfxModel;
}
