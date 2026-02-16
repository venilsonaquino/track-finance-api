import {
  BadRequestException,
  HttpException,
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
    const walletEntity = WalletEntity.create({
      ...createWalletDto,
      userId,
    });

    await this.ensureValidPaymentAccountWallet(
      walletEntity.paymentAccountWalletId,
      userId,
    );

    try {
      this.logger.log(
        `Creating wallet user=${userId} name=${walletEntity.name} initialBalance=${MoneyHelper.centsToAmount(walletEntity.balance)}`,
        WalletsService.name,
      );

      const created = await this.walletModel.create(walletEntity);
      const response = WalletMapper.toResponse(created);

      this.logger.log(
        `Wallet created id=${response.id} user=${userId} balance=${response.balance}`,
        WalletsService.name,
      );

      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Error creating wallet for user=${userId}`,
        error instanceof Error ? error.stack : String(error),
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
    const current = await this.walletModel.findOne({
      where: { id, userId },
    });

    if (!current) {
      throw new NotFoundException(`Wallet with id ${id} not found`);
    }

    const walletEntity = WalletEntity.fromUpdate({
      id,
      userId,
      current: {
        name: current.name,
        description: current.description,
        walletType: current.walletType,
        financialType: current.financialType,
        balance: current.balance,
        bankId: current.bankId,
        dueDay: current.dueDay,
        closingDay: current.closingDay,
        paymentAccountWalletId: current.paymentAccountWalletId,
      },
      patch: updateWalletDto,
    });

    await this.ensureValidPaymentAccountWallet(
      walletEntity.paymentAccountWalletId,
      userId,
    );

    this.logger.log(
      `Updating wallet id=${id} user=${userId} name=${walletEntity.name} balance=${MoneyHelper.centsToAmount(walletEntity.balance)}`,
      WalletsService.name,
    );

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

  private async ensureValidPaymentAccountWallet(
    paymentAccountWalletId: string | null,
    userId: string,
  ) {
    if (!paymentAccountWalletId) {
      return;
    }

    const paymentWallet = await this.walletModel.findOne({
      where: { id: paymentAccountWalletId, userId },
    });

    if (!paymentWallet) {
      throw new BadRequestException('Payment account wallet not found for user.');
    }

    if (paymentWallet.financialType !== WalletFinancialType.Account) {
      throw new BadRequestException(
        'Payment account wallet must be an ACCOUNT wallet.',
      );
    }
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
