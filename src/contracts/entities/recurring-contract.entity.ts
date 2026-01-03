import { UserEntity } from 'src/users/entities/user.entity';
import { WalletEntity } from 'src/wallets/entities/wallet.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { IntervalEnum } from '../enums/interval.enum';
import { ContractStatusEnum } from '../enums/contract-status.enum';
import { RecurringOccurrenceEntity } from './recurring-occurrence.entity';

export class RecurringContractEntity {
  id: string;

  userId: string;
  walletId: string;
  categoryId: string;

  description: string;
  amount: string;

  interval: IntervalEnum;
  firstDueDate: string;

  endsAt?: string | null;

  status: ContractStatusEnum;

  createdAt?: Date;
  updatedAt?: Date;

  user?: UserEntity;
  wallet?: WalletEntity;
  category?: CategoryEntity;
  occurrences?: RecurringOccurrenceEntity[];

  constructor(partial: Partial<RecurringContractEntity>) {
    Object.assign(this, partial);
  }
}
