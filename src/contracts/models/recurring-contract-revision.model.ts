import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ulid } from 'ulid';
import { RecurringContractModel } from './recurring-contract.model';

@Table({
  tableName: 'recurring_contract_revisions',
  indexes: [
    {
      unique: true,
      fields: ['contract_id', 'effective_from'],
      name: 'recurring_contract_revisions_contract_id_effective_from_unique',
    },
  ],
})
export class RecurringContractRevisionModel extends Model<RecurringContractRevisionModel> {
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
    field: 'effective_from',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  effectiveFrom: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: string;

  @BelongsTo(() => RecurringContractModel, {
    as: 'contract',
    foreignKey: 'contractId',
  })
  contract: RecurringContractModel;
}
