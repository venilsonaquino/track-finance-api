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
import { UserModel } from 'src/users/models/user.model';
import { WalletModel } from 'src/wallets/models/wallet.model';
import { TransactionModel } from 'src/transactions/models/transaction.model';
import { CardStatementStatusEnum } from '../enums/card-statement-status.enum';

@Table({
  tableName: 'card_statements',
  indexes: [
    {
      unique: true,
      fields: ['card_wallet_id', 'reference_month'],
      name: 'card_statements_card_wallet_id_reference_month_unique',
    },
  ],
})
export class CardStatementModel extends Model<CardStatementModel> {
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
    field: 'card_wallet_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  cardWalletId: string;

  @Column({
    field: 'reference_month',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  referenceMonth: string;

  @Column({
    field: 'period_start',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  periodStart: string;

  @Column({
    field: 'period_end',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  periodEnd: string;

  @Column({
    field: 'due_date',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  dueDate: string;

  @Column({
    field: 'total_amount',
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: '0.00',
  })
  totalAmount: string;

  @Column({
    type: DataType.ENUM,
    values: [
      CardStatementStatusEnum.Open,
      CardStatementStatusEnum.Paid,
      CardStatementStatusEnum.Cancelled,
      CardStatementStatusEnum.Overdue,
    ],
    allowNull: false,
    defaultValue: CardStatementStatusEnum.Open,
  })
  status: CardStatementStatusEnum;

  @ForeignKey(() => WalletModel)
  @Column({
    field: 'payment_wallet_id',
    type: DataType.STRING(26),
    allowNull: true,
    defaultValue: null,
  })
  paymentWalletId?: string | null;

  @ForeignKey(() => TransactionModel)
  @Column({
    field: 'payment_transaction_id',
    type: DataType.STRING(26),
    allowNull: true,
    defaultValue: null,
  })
  paymentTransactionId?: string | null;

  @Column({
    field: 'paid_at',
    type: DataType.DATEONLY,
    allowNull: true,
    defaultValue: null,
  })
  paidAt?: string | null;

  @BelongsTo(() => WalletModel, {
    as: 'cardWallet',
    foreignKey: 'cardWalletId',
  })
  cardWallet: WalletModel;
}
