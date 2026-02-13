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
import { WalletFinancialType } from './enums/wallet-financial-type.enum';

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
      const financialType =
        createWalletDto.financialType ?? WalletFinancialType.Account;
      const normalizedBalance =
        financialType === WalletFinancialType.CreditCard
          ? 0
          : createWalletDto.balance;

      this.logger.log(
        `Creating wallet user=${userId} name=${createWalletDto.name} initialBalance=${normalizedBalance}`,
        WalletsService.name,
      );

      const walletEntity = new WalletEntity({
        name: createWalletDto.name,
        description: createWalletDto.description,
        walletType: createWalletDto.walletType,
        financialType,
        balance: normalizedBalance,
        userId: userId,
        bankId: createWalletDto.bankId || null,
        dueDay: createWalletDto.dueDay ?? null,
        closingDay: createWalletDto.closingDay ?? null,
        paymentAccountWalletId: createWalletDto.paymentAccountWalletId ?? null,
      });

      const created = await this.walletModel.create(walletEntity);
      const response = WalletMapper.toResponse(created);

      this.logger.log(
        `Wallet created id=${response.id} user=${userId} balance=${response.balance}`,
        WalletsService.name,
      );

      return response;
    } catch (error) {
      this.logger.error(
        `Error creating wallet for user=${userId}`,
        error?.stack,
        WalletsService.name,
      );
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
    const financialType =
      updateWalletDto.financialType ?? WalletFinancialType.Account;
    const normalizedBalance =
      financialType === WalletFinancialType.CreditCard
        ? 0
        : updateWalletDto.balance;

    this.logger.log(
      `Updating wallet id=${id} user=${userId} name=${updateWalletDto.name} balance=${normalizedBalance}`,
      WalletsService.name,
    );

    const walletEntity = new WalletEntity({
      name: updateWalletDto.name,
      description: updateWalletDto.description,
      walletType: updateWalletDto.walletType,
      financialType,
      balance: normalizedBalance,
      userId: userId,
      bankId: updateWalletDto.bankId || null,
      dueDay: updateWalletDto.dueDay ?? null,
      closingDay: updateWalletDto.closingDay ?? null,
      paymentAccountWalletId: updateWalletDto.paymentAccountWalletId ?? null,
    });

    const [affectedCount, updated] = await this.walletModel.update(
      walletEntity,
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
      where: {
        userId,
        financialType: WalletFinancialType.Account,
      },
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
