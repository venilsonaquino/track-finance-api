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
import { ContractStatusEnum } from '../enums/contract-status.enum';
import { IntervalEnum } from '../enums/interval.enum';
import { ulid } from 'ulid';
import { InstallmentOccurrenceModel } from './installment-occurrence.model';
import { TransactionType } from 'src/transactions/enums/transaction-type.enum';
import { TransactionStatus } from 'src/transactions/enums/transaction-status.enum';

@Table({
  tableName: 'installment_contracts',
})
export class InstallmentContractModel extends Model<InstallmentContractModel> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(26),
    defaultValue: ulid,
  })
  id: string;

  @ForeignKey(() => UserModel)
  @Column({
    field: 'user_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  userId: string;

  @ForeignKey(() => WalletModel)
  @Column({
    field: 'wallet_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  walletId: string;

  @ForeignKey(() => CategoryModel)
  @Column({
    field: 'category_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  categoryId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  description: string;

  @Column({
    field: 'total_amount',
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalAmount: string;

  @Column({
    field: 'installment_count',
    type: DataType.INTEGER,
    allowNull: false,
  })
  installmentsCount: number;

  @Column({
    field: 'installment_interval',
    type: DataType.ENUM,
    values: [
      IntervalEnum.Daily,
      IntervalEnum.Weekly,
      IntervalEnum.Monthly,
      IntervalEnum.Yearly,
    ],
    allowNull: false,
  })
  installmentInterval: IntervalEnum;
  @Column({
    field: 'first_due_date',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  firstDueDate: string;

  @Column({
    type: DataType.ENUM,
    values: [
      ContractStatusEnum.Active,
      ContractStatusEnum.Paused,
      ContractStatusEnum.Cancelled,
      ContractStatusEnum.Finished,
    ],
    allowNull: false,
    defaultValue: ContractStatusEnum.Active,
  })
  status: ContractStatusEnum;

  @Column({
    field: 'transaction_type',
    type: DataType.ENUM,
    values: [TransactionType.Income, TransactionType.Expense],
    allowNull: true,
  })
  transactionType?: TransactionType | null;

  @Column({
    field: 'transaction_status',
    type: DataType.ENUM,
    values: [TransactionStatus.Posted, TransactionStatus.Reversed],
    allowNull: true,
    defaultValue: TransactionStatus.Posted,
  })
  transactionStatus?: TransactionStatus | null;

  @BelongsTo(() => UserModel)
  user: UserEntity;

  @BelongsTo(() => WalletModel)
  wallet: WalletEntity;

  @BelongsTo(() => CategoryModel)
  category: CategoryEntity;

  @HasMany(() => InstallmentOccurrenceModel, {
    foreignKey: 'contractId',
    as: 'occurrences',
  })
  occurrences: InstallmentOccurrenceModel[];
}
