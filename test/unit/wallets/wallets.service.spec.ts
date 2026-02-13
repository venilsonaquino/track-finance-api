import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { WalletsService } from 'src/wallets/wallets.service';
import { WalletFinancialType } from 'src/wallets/enums/wallet-financial-type.enum';

describe('WalletsService', () => {
  let service: WalletsService;
  let walletModel: any;
  let logger: any;

  beforeEach(() => {
    walletModel = {
      create: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
      sum: jest.fn(),
    };
    logger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    service = new WalletsService(walletModel as any, logger as any);
  });

  it('creates a wallet and returns a response DTO with formatted balance', async () => {
    walletModel.create.mockResolvedValueOnce({
      id: 'wallet-1',
      name: 'Main',
      description: 'Main wallet',
      walletType: 'Personal',
      balance: 1234,
      userId: 'user-1',
      bankId: null,
    });

    const result = await service.create(
      {
        name: 'Main',
        description: 'Main wallet',
        walletType: 'Personal',
        balance: 12.34,
        bankId: null,
      } as any,
      'user-1',
    );

    expect(walletModel.create).toHaveBeenCalledTimes(1);
    expect(result.balance).toBe(12.34);
    expect(result.userId).toBe('user-1');
  });

  it('forces balance to zero when creating a CREDIT_CARD wallet', async () => {
    walletModel.create.mockResolvedValueOnce({
      id: 'wallet-1',
      name: 'Card',
      description: 'Credit card',
      walletType: 'Personal',
      financialType: WalletFinancialType.CreditCard,
      balance: 0,
      userId: 'user-1',
      bankId: null,
    });

    const result = await service.create(
      {
        name: 'Card',
        description: 'Credit card',
        walletType: 'Personal',
        financialType: WalletFinancialType.CreditCard,
        balance: 999.99,
      } as any,
      'user-1',
    );

    expect(walletModel.create).toHaveBeenCalledTimes(1);
    expect(walletModel.create.mock.calls[0][0].balance).toBe(0);
    expect(result.balance).toBe(0);
  });

  it('throws InternalServerErrorException when create fails', async () => {
    walletModel.create.mockRejectedValueOnce(new Error('DB error'));

    await expect(
      service.create(
        {
          name: 'Main',
          description: 'Main wallet',
          walletType: 'Personal',
          balance: 10,
          bankId: null,
        } as any,
        'user-1',
      ),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('updates a wallet and returns the updated response', async () => {
    walletModel.update.mockResolvedValueOnce([
      1,
      [
        {
          id: 'wallet-1',
          name: 'Updated',
          description: 'Updated wallet',
          walletType: 'Personal',
          balance: 500,
          userId: 'user-1',
          bankId: null,
        },
      ],
    ]);

    const result = await service.update(
      'wallet-1',
      {
        name: 'Updated',
        description: 'Updated wallet',
        walletType: 'Personal',
        balance: 5,
        bankId: null,
        userId: 'user-1',
      } as any,
      'user-1',
    );

    expect(walletModel.update).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Updated');
    expect(result.balance).toBe(5);
  });

  it('throws NotFoundException when update affects no rows', async () => {
    walletModel.update.mockResolvedValueOnce([0, []]);

    await expect(
      service.update(
        'wallet-1',
        {
          name: 'Updated',
          description: 'Updated wallet',
          walletType: 'Personal',
          balance: 5,
          bankId: null,
          userId: 'user-1',
        } as any,
        'user-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('adjusts balance in cents and returns updated wallet', async () => {
    const wallet = {
      id: 'wallet-1',
      balance: 0,
      increment: jest.fn().mockImplementationOnce(() => {
        wallet.balance = 1000;
        return Promise.resolve();
      }),
      reload: jest.fn().mockImplementationOnce(() => Promise.resolve()),
    };
    walletModel.findOne.mockResolvedValueOnce(wallet);

    const result = await service.adjustBalance('wallet-1', 'user-1', 10);

    expect(wallet.increment).toHaveBeenCalledWith('balance', { by: 1000 });
    expect(wallet.reload).toHaveBeenCalledTimes(1);
    expect(result.balance).toBe(10);
  });

  it('sums current balance using only ACCOUNT wallets', async () => {
    walletModel.sum.mockResolvedValueOnce(1500);

    const result = await service.findBalanceCurrent('user-1');

    expect(walletModel.sum).toHaveBeenCalledWith('balance', {
      where: {
        userId: 'user-1',
        financialType: WalletFinancialType.Account,
      },
    });
    expect(result).toBe(15);
  });
});
