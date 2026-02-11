import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ContractsService } from 'src/contracts/contracts.service';
import { IntervalEnum } from 'src/contracts/enums/interval.enum';
import { ContractStatusEnum } from 'src/contracts/enums/contract-status.enum';
import { OccurrenceStatusEnum } from 'src/contracts/enums/installment-occurrence-status.enum';

describe('ContractsService', () => {
  let service: ContractsService;
  let sequelize: any;
  let contractRepo: any;
  let occurrenceRepo: any;
  let recurringContractRepo: any;
  let recurringOccurrenceRepo: any;
  let walletRepo: any;
  let categoryRepo: any;
  let transactionRepo: any;
  let walletFacade: any;

  beforeEach(() => {
    sequelize = {
      transaction: jest.fn((cb: any) => cb({ id: 'tx' })),
    };
    contractRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
    };
    occurrenceRepo = {
      bulkCreate: jest.fn(),
      findOne: jest.fn(),
    };
    recurringContractRepo = {
      create: jest.fn(),
      findOne: jest.fn(),
    };
    recurringOccurrenceRepo = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
    };
    walletRepo = {
      findOne: jest.fn(),
    };
    categoryRepo = {
      findOne: jest.fn(),
    };
    transactionRepo = {
      create: jest.fn(),
    };
    walletFacade = {
      adjustWalletBalance: jest.fn(),
    };

    service = new ContractsService(
      sequelize,
      contractRepo,
      occurrenceRepo,
      recurringContractRepo,
      recurringOccurrenceRepo,
      walletRepo,
      categoryRepo,
      transactionRepo,
      walletFacade,
    );
  });

  it('creates installment contract and occurrences when generateOccurrences is true', async () => {
    walletRepo.findOne.mockResolvedValueOnce({ id: 'wallet-1' });
    categoryRepo.findOne.mockResolvedValueOnce({ id: 'cat-1' });
    contractRepo.create.mockResolvedValueOnce({ id: 'contract-1' });
    occurrenceRepo.bulkCreate.mockResolvedValueOnce([
      { id: 'occ-1' },
      { id: 'occ-2' },
    ]);

    const result = await service.createInstallmentContract(
      {
        walletId: 'wallet-1',
        categoryId: 'cat-1',
        description: 'Test',
        totalAmount: '100.00',
        installmentsCount: 2,
        installmentInterval: IntervalEnum.Monthly,
        firstDueDate: '2026-01-01',
        generateOccurrences: true,
      } as any,
      'user-1',
    );

    expect(contractRepo.create).toHaveBeenCalledTimes(1);
    expect(occurrenceRepo.bulkCreate).toHaveBeenCalledTimes(1);
    expect(result.contract.id).toBe('contract-1');
    expect(result.occurrences).toHaveLength(2);
  });

  it('creates installment contract without occurrences when generateOccurrences is false', async () => {
    walletRepo.findOne.mockResolvedValueOnce({ id: 'wallet-1' });
    categoryRepo.findOne.mockResolvedValueOnce({ id: 'cat-1' });
    contractRepo.create.mockResolvedValueOnce({ id: 'contract-1' });

    const result = await service.createInstallmentContract(
      {
        walletId: 'wallet-1',
        categoryId: 'cat-1',
        description: 'Test',
        totalAmount: '100.00',
        installmentsCount: 2,
        installmentInterval: IntervalEnum.Monthly,
        firstDueDate: '2026-01-01',
        generateOccurrences: false,
      } as any,
      'user-1',
    );

    expect(occurrenceRepo.bulkCreate).not.toHaveBeenCalled();
    expect(result.occurrences).toHaveLength(0);
  });

  it('throws NotFoundException when wallet is not found for installment contract', async () => {
    walletRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      service.createInstallmentContract(
        {
          walletId: 'wallet-1',
          categoryId: 'cat-1',
          description: 'Test',
          totalAmount: '100.00',
          installmentsCount: 2,
          installmentInterval: IntervalEnum.Monthly,
          firstDueDate: '2026-01-01',
        } as any,
        'user-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates recurring contract when wallet exists', async () => {
    walletRepo.findOne.mockResolvedValueOnce({ id: 'wallet-1' });
    recurringContractRepo.create.mockResolvedValueOnce({ id: 'rec-1' });

    const result = await service.createRecurringContract('user-1', {
      walletId: 'wallet-1',
      categoryId: 'cat-1',
      description: 'Recurring',
      amount: '10.00',
      installmentInterval: IntervalEnum.Monthly,
      firstDueDate: '2026-01-01',
    } as any);

    expect(recurringContractRepo.create).toHaveBeenCalledTimes(1);
    expect(result.contract.id).toBe('rec-1');
  });

  it('throws NotFoundException when wallet is not found for recurring contract', async () => {
    walletRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      service.createRecurringContract('user-1', {
        walletId: 'wallet-1',
        categoryId: 'cat-1',
        description: 'Recurring',
        amount: '10.00',
        installmentInterval: IntervalEnum.Monthly,
        firstDueDate: '2026-01-01',
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequestException when upsertOccurrenceOverride has invalid dueDate', async () => {
    await expect(
      service.upsertOccurrenceOverride(
        'contract-1',
        'invalid-date',
        { amount: '10.00' } as any,
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when status is POSTED without transactionId', async () => {
    recurringContractRepo.findOne.mockResolvedValueOnce({
      id: 'contract-1',
      firstDueDate: '2026-01-01',
      installmentInterval: IntervalEnum.Monthly,
      amount: '10.00',
      status: ContractStatusEnum.Active,
    });

    await expect(
      service.upsertOccurrenceOverride(
        'contract-1',
        '2026-01-01',
        { status: OccurrenceStatusEnum.Posted } as any,
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates override when none exists', async () => {
    recurringContractRepo.findOne.mockResolvedValueOnce({
      id: 'contract-1',
      firstDueDate: '2026-01-01',
      installmentInterval: IntervalEnum.Monthly,
      amount: '10.00',
      status: ContractStatusEnum.Active,
    });
    recurringOccurrenceRepo.findOne.mockResolvedValueOnce(null);
    recurringOccurrenceRepo.create.mockResolvedValueOnce({
      get: () => ({
        dueDate: '2026-01-01',
        amount: '10.00',
        status: OccurrenceStatusEnum.Skipped,
        transactionId: null,
      }),
    });

    const result = await service.upsertOccurrenceOverride(
      'contract-1',
      '2026-01-01',
      {},
      'user-1',
    );

    expect(recurringOccurrenceRepo.create).toHaveBeenCalledTimes(1);
    expect(result.occurrence.status).toBe(OccurrenceStatusEnum.Skipped);
    expect(result.occurrence.source).toBe('OVERRIDE');
  });

  it('updates override when it already exists', async () => {
    recurringContractRepo.findOne.mockResolvedValueOnce({
      id: 'contract-1',
      firstDueDate: '2026-01-01',
      installmentInterval: IntervalEnum.Monthly,
      amount: '10.00',
      status: ContractStatusEnum.Active,
    });
    const existing = {
      update: jest.fn().mockImplementationOnce(() => Promise.resolve()),
      get: () => ({
        dueDate: '2026-02-01',
        amount: '20.00',
        status: OccurrenceStatusEnum.Posted,
        transactionId: 'tx-1',
      }),
    };
    recurringOccurrenceRepo.findOne.mockResolvedValueOnce(existing);

    const result = await service.upsertOccurrenceOverride(
      'contract-1',
      '2026-02-01',
      {
        amount: '20.00',
        status: OccurrenceStatusEnum.Posted,
        transactionId: 'tx-1',
      } as any,
      'user-1',
    );

    expect(existing.update).toHaveBeenCalledTimes(1);
    expect(result.occurrence.status).toBe(OccurrenceStatusEnum.Posted);
  });

  it('pays installment and creates transaction', async () => {
    contractRepo.findOne.mockResolvedValueOnce({
      id: 'contract-1',
      userId: 'user-1',
      categoryId: 'cat-1',
      walletId: 'wallet-1',
      installmentsCount: 3,
      description: 'Notebook',
    });
    occurrenceRepo.findOne.mockResolvedValueOnce({
      id: 'occ-1',
      contractId: 'contract-1',
      installmentIndex: 1,
      dueDate: '2026-02-10',
      amount: '100.00',
      transactionId: null,
      update: jest.fn().mockImplementationOnce(() => Promise.resolve()),
    });
    transactionRepo.create.mockResolvedValueOnce({
      id: 'tx-1',
      amount: '100.00',
      transactionType: 'EXPENSE',
    });

    const result = await service.payInstallmentOccurrence(
      'contract-1',
      1,
      { transactionType: 'EXPENSE' } as any,
      'user-1',
    );

    expect(transactionRepo.create).toHaveBeenCalledTimes(1);
    expect(walletFacade.adjustWalletBalance).toHaveBeenCalledTimes(1);
    expect(result.transaction.id).toBe('tx-1');
  });

  it('returns generated and override occurrences for getContractOccurrences', async () => {
    recurringContractRepo.findOne.mockResolvedValueOnce({
      id: 'contract-1',
      userId: 'user-1',
      status: ContractStatusEnum.Active,
      firstDueDate: '2026-01-01',
      installmentInterval: IntervalEnum.Monthly,
      amount: '15.00',
    });
    recurringOccurrenceRepo.findAll.mockResolvedValueOnce([
      {
        get: () => ({
          contractId: 'contract-1',
          dueDate: '2026-02-01',
          amount: '10.00',
          status: OccurrenceStatusEnum.Skipped,
          transactionId: null,
        }),
      },
    ]);

    const result = await service.getContractOccurrences(
      'contract-1',
      { from: '2026-01-01', to: '2026-03-01' } as any,
      'user-1',
    );

    expect(recurringOccurrenceRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result.contractId).toBe('contract-1');
    expect(result.items.length).toBeGreaterThan(0);
  });
});
