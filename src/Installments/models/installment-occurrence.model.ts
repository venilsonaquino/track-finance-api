import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { TransactionEntity } from 'src/transactions/entities/transaction.entity';
import { TransactionModel } from 'src/transactions/models/transaction.model';
import { ulid } from 'ulid';
import { InstallmentContractModel } from './installment-contract.model';
import { InstallmentOccurrenceStatus } from '../enums/installment-occurrence-status.enum';

@Table({
  tableName: 'installment_occurrences',
})
export class InstallmentOccurrenceModel extends Model<InstallmentOccurrenceModel> {
  @PrimaryKey
  @Column({
    type: 'VARCHAR(26)',
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
  })
  installmentIndex: number;

  @Column({
    field: 'due_date',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  dueDate: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount: number;

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
  })
  transactionId: string | null;

  @BelongsTo(() => InstallmentContractModel)
  contract: InstallmentContractModel;

  @BelongsTo(() => TransactionModel)
  transaction: TransactionEntity;
}
