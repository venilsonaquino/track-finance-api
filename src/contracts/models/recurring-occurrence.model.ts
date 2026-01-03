import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ulid } from 'ulid';

import { RecurringContractModel } from './recurring-contract.model';
import { TransactionModel } from 'src/transactions/models/transaction.model';
import { OccurrenceStatusEnum } from '../enums/installment-occurrence-status.enum';

@Table({
  tableName: 'recurring_occurrences',
  indexes: [
    {
      unique: true,
      fields: ['contract_id', 'due_date'],
    },
  ],
})
export class RecurringOccurrenceModel extends Model<RecurringOccurrenceModel> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(26),
    defaultValue: ulid,
  })
  id: string;

  @ForeignKey(() => RecurringContractModel)
  @Column({
    field: 'contract_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  contractId: string;

  @Column({
    field: 'due_date',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  dueDate: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: string;

  @Column({
    type: DataType.ENUM,
    values: [
      OccurrenceStatusEnum.Scheduled,
      OccurrenceStatusEnum.Posted,
      OccurrenceStatusEnum.Skipped,
      OccurrenceStatusEnum.Cancelled,
    ],
    allowNull: false,
    defaultValue: OccurrenceStatusEnum.Scheduled,
  })
  status: OccurrenceStatusEnum;

  @ForeignKey(() => TransactionModel)
  @Column({
    field: 'transaction_id',
    type: DataType.STRING(26),
    allowNull: true,
    defaultValue: null,
  })
  transactionId: string | null;

  @BelongsTo(() => RecurringContractModel, {
    as: 'contract',
    foreignKey: 'contractId',
  })
  contract: RecurringContractModel;

  // @BelongsTo(() => TransactionModel, {
  //   as: 'transaction',
  //   foreignKey: 'transactionId',
  // })
  // transaction?: TransactionModel;
}
