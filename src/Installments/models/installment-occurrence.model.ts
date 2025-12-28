import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { TransactionModel } from 'src/transactions/models/transaction.model';
import { ulid } from 'ulid';
import { InstallmentContractModel } from './installment-contract.model';
import { InstallmentOccurrenceStatus } from '../enums/installment-occurrence-status.enum';

@Table({
  tableName: 'installment_occurrences',
  indexes: [
    {
      unique: true,
      fields: ['contract_id', 'installment_index'],
    },
  ],
})
export class InstallmentOccurrenceModel extends Model<InstallmentOccurrenceModel> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(26),
    defaultValue: ulid,
  })
  id: string;

  @ForeignKey(() => InstallmentContractModel)
  @Column({
    field: 'contract_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  contractId: string;

  @Column({
    field: 'installment_index',
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  installmentIndex: number;

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
      InstallmentOccurrenceStatus.Scheduled,
      InstallmentOccurrenceStatus.Posted,
      InstallmentOccurrenceStatus.Cancelled,
    ],
    allowNull: false,
    defaultValue: InstallmentOccurrenceStatus.Scheduled,
  })
  status: InstallmentOccurrenceStatus;

  @ForeignKey(() => TransactionModel)
  @Column({
    field: 'transaction_id',
    type: DataType.STRING(26),
    allowNull: true,
    defaultValue: null,
  })
  transactionId: string | null;

  @BelongsTo(() => InstallmentContractModel, { foreignKey: 'contractId', as: 'contract' })
  contract: InstallmentContractModel;

  @BelongsTo(() => TransactionModel, { foreignKey: 'transactionId', as: 'transaction' })
  transaction?: TransactionModel;
}
