import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsService } from 'src/transactions/transactions.service';
import { TransactionType } from 'src/transactions/enums/transaction-type.enum';
import { TransactionStatus } from 'src/transactions/enums/transaction-status.enum';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionalModel: any;
  let transactionOfxService: any;
  let installmentOccurrenceRepo: any;
  let recurringOccurrenceRepo: any;
  let recurringContractRepo: any;
  let walletFacade: any;
  let logger: any;

  beforeEach(() => {
    transactionalModel = {
      create: jest.fn(),
      bulkCreate: jest.fn(),
    };
    transactionOfxService = {
      buildPayload: jest.fn().mockReturnValue(null),
      createDetails: jest.fn(),
      bulkCreateDetails: jest.fn(),
      syncDetails: jest.fn(),
    };
    installmentOccurrenceRepo = {
      findAll: jest.fn(),
    };
    recurringOccurrenceRepo = {
      findAll: jest.fn(),
    };
    recurringContractRepo = {
      findAll: jest.fn(),
    };
    walletFacade = {
      adjustWalletBalance: jest.fn(),
      getWalletBalance: jest.fn(),
    };
    logger = {
      log: jest.fn(),
    };

    service = new TransactionsService(
      transactionalModel as any,
      installmentOccurrenceRepo as any,
      recurringOccurrenceRepo as any,
      recurringContractRepo as any,
      walletFacade as any,
      logger as any,
      transactionOfxService as any,
    );
  });

  it('creates a transaction and adjusts balance when affectBalance is true', async () => {
    transactionalModel.create.mockResolvedValueOnce({ id: 'tx-1' });
    walletFacade.adjustWalletBalance.mockResolvedValueOnce({});

    const dto = {
      depositedDate: '2026-01-01',
      description: 'Salary',
      amount: 100,
      userId: 'user-1',
      categoryId: 'cat-1',
      walletId: 'wallet-1',
      transactionType: TransactionType.Income,
      transactionStatus: TransactionStatus.Posted,
      affectBalance: true,
    } as any;

    await service.create(dto, 'user-1');

    expect(transactionalModel.create).toHaveBeenCalledTimes(1);
    const created = transactionalModel.create.mock.calls[0][0];
    expect(created.amount).toBe(100);
    expect(created.transactionType).toBe(TransactionType.Income);

    expect(walletFacade.adjustWalletBalance).toHaveBeenCalledWith(
      'wallet-1',
      'user-1',
      100,
    );
  });

  it('creates a transaction without adjusting balance when affectBalance is false', async () => {
    transactionalModel.create.mockResolvedValueOnce({ id: 'tx-2' });

    const dto = {
      depositedDate: '2026-01-02',
      description: 'Expense',
      amount: 50,
      userId: 'user-1',
      categoryId: 'cat-1',
      walletId: 'wallet-1',
      transactionType: TransactionType.Expense,
      transactionStatus: TransactionStatus.Posted,
      affectBalance: false,
    } as any;

    await service.create(dto, 'user-1');

    expect(transactionalModel.create).toHaveBeenCalledTimes(1);
    expect(walletFacade.adjustWalletBalance).not.toHaveBeenCalled();
  });

  it('throws InternalServerErrorException when create fails', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    transactionalModel.create.mockRejectedValueOnce({
      parent: { detail: 'Unique violation' },
    });

    const dto = {
      depositedDate: '2026-01-03',
      description: 'Transfer',
      amount: 25,
      userId: 'user-1',
      categoryId: 'cat-1',
      walletId: 'wallet-1',
      transactionType: TransactionType.Expense,
      transactionStatus: TransactionStatus.Posted,
      affectBalance: false,
    } as any;

    await expect(service.create(dto, 'user-1')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    consoleSpy.mockRestore();
  });

  it('creates many transactions and adjusts balance for those flagged', async () => {
    transactionalModel.bulkCreate.mockResolvedValueOnce([
      { id: 'tx-1' },
      { id: 'tx-2' },
    ]);

    const dtos = [
      {
        depositedDate: '2026-02-01',
        description: 'Income',
        amount: 200,
        userId: 'user-1',
        categoryId: 'cat-1',
        walletId: 'wallet-1',
        transactionType: TransactionType.Income,
        transactionStatus: TransactionStatus.Posted,
        affectBalance: true,
      },
      {
        depositedDate: '2026-02-02',
        description: 'Expense',
        amount: 40,
        userId: 'user-1',
        categoryId: 'cat-1',
        walletId: 'wallet-1',
        transactionType: TransactionType.Expense,
        transactionStatus: TransactionStatus.Posted,
        affectBalance: false,
      },
    ] as any[];

    await service.createMany(dtos, 'user-1');

    expect(transactionalModel.bulkCreate).toHaveBeenCalledTimes(1);
    expect(walletFacade.adjustWalletBalance).toHaveBeenCalledTimes(1);
    expect(walletFacade.adjustWalletBalance).toHaveBeenCalledWith(
      'wallet-1',
      'user-1',
      200,
    );
  });

  it('updates transaction fields and moves balance when wallet changes', async () => {
    transactionalModel.findOne = jest.fn(async () => ({
      id: 'tx-1',
      amount: '50.00',
      walletId: 'wallet-old',
      transactionType: TransactionType.Expense,
      transactionStatus: TransactionStatus.Posted,
    }));
    transactionalModel.update = jest.fn(async () => [
      1,
      [
        {
          id: 'tx-1',
          description: 'Updated description',
          depositedDate: '2026-02-10',
          categoryId: 'cat-2',
          walletId: 'wallet-new',
        },
      ],
    ]);

    const dto = {
      description: 'Updated description',
      depositedDate: '2026-02-10',
      categoryId: 'cat-2',
      walletId: 'wallet-new',
    };

    const result = await service.update('tx-1', dto as any, 'user-1');

    expect(transactionalModel.update).toHaveBeenCalledWith(
      {
        description: 'Updated description',
        depositedDate: '2026-02-10',
        categoryId: 'cat-2',
        walletId: 'wallet-new',
      },
      {
        where: { id: 'tx-1', userId: 'user-1' },
        returning: true,
      },
    );
    expect(walletFacade.adjustWalletBalance).toHaveBeenNthCalledWith(
      1,
      'wallet-old',
      'user-1',
      50,
    );
    expect(walletFacade.adjustWalletBalance).toHaveBeenNthCalledWith(
      2,
      'wallet-new',
      'user-1',
      -50,
    );
    expect(result).toEqual({
      id: 'tx-1',
      description: 'Updated description',
      depositedDate: '2026-02-10',
      categoryId: 'cat-2',
      walletId: 'wallet-new',
    });
  });

  it('updates transaction without moving balance when wallet does not change', async () => {
    transactionalModel.findOne = jest.fn(async () => ({
      id: 'tx-1',
      amount: '120.00',
      walletId: 'wallet-1',
      transactionType: TransactionType.Income,
      transactionStatus: TransactionStatus.Posted,
    }));
    transactionalModel.update = jest.fn(async () => [
      1,
      [
        {
          id: 'tx-1',
          description: 'Edited',
          depositedDate: '2026-02-11',
          categoryId: 'cat-1',
          walletId: 'wallet-1',
        },
      ],
    ]);

    await service.update(
      'tx-1',
      {
        description: 'Edited',
        depositedDate: '2026-02-11',
        categoryId: 'cat-1',
        walletId: 'wallet-1',
      } as any,
      'user-1',
    );

    expect(walletFacade.adjustWalletBalance).not.toHaveBeenCalled();
  });

  it('updates transaction without moving balance when status is reversed', async () => {
    transactionalModel.findOne = jest.fn(async () => ({
      id: 'tx-1',
      amount: '120.00',
      walletId: 'wallet-1',
      transactionType: TransactionType.Income,
      transactionStatus: TransactionStatus.Reversed,
    }));
    transactionalModel.update = jest.fn(async () => [
      1,
      [
        {
          id: 'tx-1',
          description: 'Edited',
          depositedDate: '2026-02-11',
          categoryId: 'cat-1',
          walletId: 'wallet-2',
        },
      ],
    ]);

    await service.update(
      'tx-1',
      {
        description: 'Edited',
        depositedDate: '2026-02-11',
        categoryId: 'cat-1',
        walletId: 'wallet-2',
      } as any,
      'user-1',
    );

    expect(walletFacade.adjustWalletBalance).not.toHaveBeenCalled();
  });

  it('reverses a transaction successfully', async () => {
    transactionalModel.findOne = jest.fn(async () => ({
      id: 'tx-1',
      amount: '100.00',
      transactionType: TransactionType.Income,
      walletId: 'wallet-1',
      transactionStatus: TransactionStatus.Posted,
    }));
    transactionalModel.update = jest.fn(async () => [
        1,
        [{ id: 'tx-1', transactionStatus: TransactionStatus.Reversed }],
      ]);

    const result = await service.reverse('tx-1', 'user-1');

    expect(transactionalModel.findOne).toHaveBeenCalledWith({
      where: { id: 'tx-1', userId: 'user-1' },
    });
    expect(transactionalModel.update).toHaveBeenCalledWith(
      { transactionStatus: TransactionStatus.Reversed },
      {
        where: { id: 'tx-1', userId: 'user-1' },
        returning: true,
      },
    );
    expect(walletFacade.adjustWalletBalance).toHaveBeenCalledWith(
      'wallet-1',
      'user-1',
      -100,
    );
    expect(result).toEqual({
      id: 'tx-1',
      transactionStatus: TransactionStatus.Reversed,
    });
  });

  it('throws NotFoundException when reversing a non-existing transaction', async () => {
    transactionalModel.findOne = jest.fn(async () => null);

    await expect(service.reverse('tx-404', 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(transactionalModel.update).toBeUndefined();
    expect(walletFacade.adjustWalletBalance).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when transaction is already reversed', async () => {
    transactionalModel.findOne = jest.fn(async () => ({
      id: 'tx-1',
      amount: '100.00',
      transactionType: TransactionType.Income,
      walletId: 'wallet-1',
      transactionStatus: TransactionStatus.Reversed,
    }));

    await expect(service.reverse('tx-1', 'user-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(transactionalModel.update).toBeUndefined();
    expect(walletFacade.adjustWalletBalance).not.toHaveBeenCalled();
  });
});
