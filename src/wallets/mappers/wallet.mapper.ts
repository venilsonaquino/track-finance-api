import { WalletEntity } from '../entities/wallet.entity';
import { WalletModel } from '../models/wallet.model';
import MoneyHelper from '../helpers/money.helper';
import { WalletResponseDto } from '../dto/wallet-response.dto';

export class WalletMapper {
  static toEntity(model: WalletModel): WalletEntity {
    return new WalletEntity({
      id: model.id,
      name: model.name,
      description: model.description,
      walletType: model.walletType,
      balance: model.balance,
      userId: model.userId,
      bankId: model.bankId,
    });
  }

  static toResponse(model: WalletModel): WalletResponseDto {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      walletType: model.walletType,
      balance: MoneyHelper.centsToAmount(model.balance),
      userId: model.userId,
      bankId: model.bankId,
    };
  }
}
