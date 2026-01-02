import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  Index,
} from 'sequelize-typescript';
import { ulid } from 'ulid';
import { OccurrenceStatusEnum } from '../enums/installment-occurrence-status.enum';
import { RecurringContractModel } from './recurring-contract.model';

@Table({
  tableName: 'override_occurrence_contracts',
  timestamps: true,
})
export class OccurrenceOverrideContractModel extends Model<OccurrenceOverrideContractModel> {
  
  @PrimaryKey
  @Default(ulid)
  @Column(DataType.STRING(26))
  id: string;

  @Index('ux_contract_due_date')
  @ForeignKey(() => RecurringContractModel)
  @Column({
    type: DataType.STRING(26),
    allowNull: false,
  })
  contractId: string;

  @Index('ux_contract_due_date')
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  dueDate: string; // YYYY-MM-DD

  @Column({
    type: DataType.DECIMAL(14, 2),
    allowNull: false,
  })
  amount: string;

  @Column({
    type: DataType.ENUM(...Object.values(OccurrenceStatusEnum)),
    allowNull: false,
  })
  status: OccurrenceStatusEnum;

  @Column({
    type: DataType.STRING(26),
    allowNull: true,
  })
  transactionId: string | null;
}
