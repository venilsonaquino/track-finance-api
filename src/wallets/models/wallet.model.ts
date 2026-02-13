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
import { TransactionEntity } from 'src/transactions/entities/transaction.entity';
import { TransactionModel } from 'src/transactions/models/transaction.model';
import { UserEntity } from 'src/users/entities/user.entity';
import { UserModel } from 'src/users/models/user.model';
import { ulid } from 'ulid';
import { WalletFinancialType } from '../enums/wallet-financial-type.enum';

@Table({
  tableName: 'wallets',
})
export class WalletModel extends Model<WalletModel> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(26),
    defaultValue: ulid,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: true, //TODO: depois mudar para false quando criar a entidade de walletType
  })
  walletType: string;

  @Column({
    field: 'financial_type',
    type: DataType.ENUM,
    values: [WalletFinancialType.Account, WalletFinancialType.CreditCard],
    allowNull: false,
    defaultValue: WalletFinancialType.Account,
  })
  financialType: WalletFinancialType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  bankId: string | null;

  @Column({
    field: 'due_day',
    type: DataType.INTEGER,
    allowNull: true,
  })
  dueDay: number | null;

  @Column({
    field: 'closing_day',
    type: DataType.INTEGER,
    allowNull: true,
  })
  closingDay: number | null;

  @ForeignKey(() => WalletModel)
  @Column({
    field: 'payment_account_wallet_id',
    type: DataType.STRING(26),
    allowNull: true,
  })
  paymentAccountWalletId: string | null;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: 0,
  })
  balance: number;

  @ForeignKey(() => UserModel)
  @Column({
    field: 'user_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => UserModel)
  user: UserEntity;

  @HasMany(() => TransactionModel)
  transactions: TransactionEntity[];
}
