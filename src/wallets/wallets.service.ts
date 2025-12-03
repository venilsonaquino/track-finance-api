import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletModel } from './models/wallet.model';
import { WalletEntity } from './entities/wallet.entity';
import MoneyHelper from './helpers/money.helper';
import { LoggerService } from 'src/config/logging/logger.service';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { WalletMapper } from './mappers/wallet.mapper';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(WalletModel)
    private readonly walletModel: typeof WalletModel,
    private readonly logger: LoggerService,
  ) {}

  async create(
    createWalletDto: CreateWalletDto,
    userId: string,
  ): Promise<WalletResponseDto> {
    try {
      const walletEntity = new WalletEntity({
        name: createWalletDto.name,
        description: createWalletDto.description,
        walletType: createWalletDto.walletType,
        balance: createWalletDto.balance,
        userId: userId,
        bankId: createWalletDto.bankId || null,
      });

      const created = await this.walletModel.create(walletEntity);
      return WalletMapper.toResponse(created);
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new InternalServerErrorException('Failed to create wallet');
    }
  }

  async findAll(userId: string): Promise<WalletResponseDto[]> {
    const wallets = await this.walletModel.findAll({ where: { userId } });
    return wallets.map((wallet) => WalletMapper.toResponse(wallet));
  }

  async findOne(id: string, userId: string): Promise<WalletResponseDto> {
    const wallet = await this.walletModel.findOne({ where: { id, userId } });
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }

    return WalletMapper.toResponse(wallet);
  }

  async update(
    id: string,
    updateWalletDto: UpdateWalletDto,
    userId: string,
  ): Promise<WalletResponseDto> {
    const [affectedCount, updated] = await this.walletModel.update(
      updateWalletDto,
      {
        where: { id, userId },
        returning: true,
      },
    );

    if (affectedCount == 0 && updated.length == 0) {
      throw new NotFoundException(`Wallet with id ${id} not found`);
    }

    return WalletMapper.toResponse(updated[0]);
  }

  async remove(id: string, userId: string): Promise<void> {
    const deletedCount = await this.walletModel.destroy({
      where: { id, userId },
    });

    if (deletedCount === 0) {
      throw new NotFoundException(`Wallet with id ${id} not found`);
    }

    return;
  }

  async findBalanceCurrent(userId: string): Promise<number> {
    const totalBalance = await this.walletModel.sum('balance', {
      where: { userId },
    });
    return MoneyHelper.centsToAmount(totalBalance || 0);
  }

  async adjustBalance(
    walletId: string,
    userId: string,
    amount: number,
  ): Promise<WalletResponseDto> {
    const wallet = await this.walletModel.findOne({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with id ${walletId} not found`);
    }

    const deltaInCents = MoneyHelper.toCents(amount);

    this.logger.log(
      `Adjusting wallet balance: walletId=${walletId} userId=${userId} delta=${amount} (cents=${deltaInCents})`,
      WalletsService.name,
    );

    await wallet.increment('balance', { by: deltaInCents });
    await wallet.reload();

    this.logger.log(
      `Wallet balance adjusted: walletId=${walletId} newBalance=${wallet.balance}`,
      WalletsService.name,
    );

    return WalletMapper.toResponse(wallet);
  }
}
