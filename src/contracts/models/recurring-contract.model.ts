// src/recurring/models/recurring-contract.model.ts
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
import { ulid } from 'ulid';

import { UserModel } from 'src/users/models/user.model';
import { WalletModel } from 'src/wallets/models/wallet.model';
import { CategoryModel } from 'src/categories/models/category.model';

import { UserEntity } from 'src/users/entities/user.entity';
import { WalletEntity } from 'src/wallets/entities/wallet.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { IntervalEnum } from '../enums/interval.enum';
import { ContractStatusEnum } from '../enums/contract-status.enum';
import { RecurringOccurrenceModel } from './recurring-occurrence.model';
import { RecurringContractRevisionModel } from './recurring-contract-revision.model';

@Table({ tableName: 'recurring_contracts' })
export class RecurringContractModel extends Model<RecurringContractModel> {
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
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: string;

  @Column({
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

  // contrato fixo NÃO termina por padrão => endsAt é opcional (pode nem existir agora)
  @Column({
    field: 'ends_at',
    type: DataType.DATEONLY,
    allowNull: true,
    defaultValue: null,
  })
  endsAt: string | null;

  @Column({
    type: DataType.ENUM,
    values: [
      ContractStatusEnum.Active,
      ContractStatusEnum.Paused,
      ContractStatusEnum.Cancelled,
    ],
    allowNull: false,
    defaultValue: ContractStatusEnum.Active,
  })
  status: ContractStatusEnum;

  @BelongsTo(() => UserModel)
  user: UserEntity;

  @BelongsTo(() => WalletModel)
  wallet: WalletEntity;

  @BelongsTo(() => CategoryModel)
  category: CategoryEntity;

  @HasMany(() => RecurringOccurrenceModel, {
    foreignKey: 'contractId',
    as: 'occurrences',
  })
  occurrences: RecurringOccurrenceModel[];

  @HasMany(() => RecurringContractRevisionModel, {
    foreignKey: 'contractId',
    as: 'revisions',
  })
  revisions: RecurringContractRevisionModel[];
}
