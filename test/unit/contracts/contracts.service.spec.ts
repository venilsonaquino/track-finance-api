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
      findAll: jest.fn(async () => []),
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
      transactionType: 'EXPENSE',
      transactionStatus: 'POSTED',
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
      {} as any,
      'user-1',
    );

    expect(transactionRepo.create).toHaveBeenCalledTimes(1);
    expect(walletFacade.adjustWalletBalance).toHaveBeenCalledTimes(1);
    expect(result.transaction.id).toBe('tx-1');
  });

  it('pays recurring occurrence and creates transaction', async () => {
    recurringContractRepo.findOne.mockResolvedValueOnce({
      id: 'rec-1',
      userId: 'user-1',
      categoryId: 'cat-1',
      walletId: 'wallet-1',
      description: 'Assinatura',
      transactionType: 'EXPENSE',
      transactionStatus: 'POSTED',
    });
    recurringOccurrenceRepo.findOne.mockResolvedValueOnce({
      id: 'roc-1',
      contractId: 'rec-1',
      dueDate: '2026-02-15',
      amount: '50.00',
      transactionId: null,
      update: jest.fn().mockImplementationOnce(() => Promise.resolve()),
    });
    transactionRepo.create.mockResolvedValueOnce({
      id: 'tx-2',
      amount: '50.00',
      transactionType: 'EXPENSE',
    });

    const result = await service.payRecurringOccurrence(
      'rec-1',
      '2026-02-15',
      {} as any,
      'user-1',
    );

    expect(transactionRepo.create).toHaveBeenCalledTimes(1);
    expect(walletFacade.adjustWalletBalance).toHaveBeenCalledTimes(1);
    expect(result.transaction.id).toBe('tx-2');
  });

  it('throws BadRequestException when paying installment without contract transactionType', async () => {
    contractRepo.findOne.mockResolvedValueOnce({
      id: 'contract-1',
      userId: 'user-1',
      categoryId: 'cat-1',
      walletId: 'wallet-1',
      installmentsCount: 3,
      description: 'Notebook',
      transactionType: null,
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

    await expect(
      service.payInstallmentOccurrence('contract-1', 1, {} as any, 'user-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
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
    expect(result.items[0]).toHaveProperty('transactionStatus');
  });

  it('returns transactionStatus for occurrences linked to transactions', async () => {
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
          status: OccurrenceStatusEnum.Posted,
          transactionId: 'tx-1',
        }),
      },
    ]);
    transactionRepo.findAll.mockResolvedValueOnce([
      { id: 'tx-1', transactionStatus: 'REVERSED' },
    ]);

    const result = await service.getContractOccurrences(
      'contract-1',
      { from: '2026-01-01', to: '2026-03-01' } as any,
      'user-1',
    );

    const linked = result.items.find((item) => item.transactionId === 'tx-1');
    expect(linked?.transactionStatus).toBe('REVERSED');
  });

  it('returns installment contract details for dashboard view', async () => {
    contractRepo.findOne.mockResolvedValueOnce({
      id: 'contract-1',
      userId: 'user-1',
      walletId: 'wallet-1',
      categoryId: 'cat-1',
      description: 'Notebook Dell Inspiron',
      totalAmount: '3600.00',
      installmentsCount: 12,
      firstDueDate: '2026-01-10',
      createdAt: new Date('2026-01-10T00:00:00.000Z'),
      wallet: { id: 'wallet-1', name: 'Nubank' },
      category: { id: 'cat-1', name: 'Eletronicos' },
      occurrences: [
        {
          id: 'occ-1',
          installmentIndex: 1,
          dueDate: '2026-01-10',
          amount: '300.00',
          installmentStatus: OccurrenceStatusEnum.Posted,
          transactionId: 'tx-1',
        },
        {
          id: 'occ-2',
          installmentIndex: 2,
          dueDate: '2026-02-10',
          amount: '300.00',
          installmentStatus: OccurrenceStatusEnum.Posted,
          transactionId: 'tx-2',
        },
        {
          id: 'occ-3',
          installmentIndex: 3,
          dueDate: '2026-03-10',
          amount: '300.00',
          installmentStatus: OccurrenceStatusEnum.Scheduled,
          transactionId: null,
        },
      ],
    });

    const result = await service.getInstallmentContractDetails(
      'contract-1',
      'user-1',
    );

    expect(result.contractId).toBe('contract-1');
    expect(result.header.title).toBe('Notebook Dell Inspiron');
    expect(result.header.installmentLabel).toBe('12x de R$ 300,00');
    expect(result.header.totalLabel).toBe('R$ 3600,00');
    expect(result.header.paidCount).toBe(2);
    expect(result.header.futureCount).toBe(10);
    expect(result.header.progress).toEqual({
      paid: 2,
      total: 12,
      percent: 17,
    });
    expect(result.contractInfo.categoryName).toBe('Eletronicos');
    expect(result.contractInfo.billingDayLabel).toBe('Todo dia 10');
    expect(result.installments[0].status).toBe('PAID');
    expect(result.installments[2].status).toBe('FUTURE');
  });

  it('maps installment status using occurrence and transactionStatus rules', async () => {
    transactionRepo.findAll.mockResolvedValueOnce([
      { id: 'tx-1', transactionStatus: 'REVERSED' },
      { id: 'tx-2', transactionStatus: 'POSTED' },
    ]);
    contractRepo.findOne.mockResolvedValueOnce({
      id: 'contract-1',
      userId: 'user-1',
      walletId: 'wallet-1',
      categoryId: 'cat-1',
      description: 'Contrato',
      totalAmount: '400.00',
      installmentsCount: 4,
      firstDueDate: '2026-01-10',
      createdAt: new Date('2026-01-10T00:00:00.000Z'),
      wallet: { id: 'wallet-1', name: 'Nubank' },
      category: { id: 'cat-1', name: 'Eletronicos' },
      occurrences: [
        {
          id: 'occ-1',
          installmentIndex: 1,
          dueDate: '2026-01-10',
          amount: '100.00',
          installmentStatus: OccurrenceStatusEnum.Posted,
          transactionId: 'tx-1',
        },
        {
          id: 'occ-2',
          installmentIndex: 2,
          dueDate: '2026-02-10',
          amount: '100.00',
          installmentStatus: OccurrenceStatusEnum.Posted,
          transactionId: 'tx-2',
        },
        {
          id: 'occ-3',
          installmentIndex: 3,
          dueDate: '2026-03-10',
          amount: '100.00',
          installmentStatus: OccurrenceStatusEnum.Cancelled,
          transactionId: null,
        },
      ],
    });

    const result = await service.getInstallmentContractDetails(
      'contract-1',
      'user-1',
    );

    expect(result.header.paidCount).toBe(2);
    expect(result.installments[0].status).toBe('REVERSED');
    expect(result.installments[1].status).toBe('PAID');
    expect(result.installments[2].status).toBe('CANCELLED');
  });

  it('throws NotFoundException when installment contract is not found', async () => {
    contractRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      service.getInstallmentContractDetails('missing-contract', 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns recurring contract details in semantic payload for screen', async () => {
    transactionRepo.findAll.mockResolvedValueOnce([
      { id: 'tx-1', transactionStatus: 'POSTED' },
      { id: 'tx-2', transactionStatus: 'POSTED' },
    ]);

    recurringContractRepo.findOne.mockResolvedValueOnce({
      id: 'rec-1',
      userId: 'user-1',
      description: 'Academia SmartFit',
      amount: '120.00',
      installmentInterval: IntervalEnum.Monthly,
      firstDueDate: '2026-01-10',
      endsAt: null,
      status: ContractStatusEnum.Active,
      createdAt: new Date('2026-01-10T00:00:00.000Z'),
      wallet: { id: 'wallet-1', name: 'Banco Inter' },
      category: { id: 'cat-1', name: 'Saude' },
      occurrences: [
        {
          id: 'ro-1',
          dueDate: '2026-01-10',
          amount: '120.00',
          status: OccurrenceStatusEnum.Posted,
          transactionId: 'tx-1',
        },
        {
          id: 'ro-2',
          dueDate: '2026-02-10',
          amount: '120.00',
          status: OccurrenceStatusEnum.Posted,
          transactionId: 'tx-2',
        },
      ],
    });

    const result = await service.getRecurringContractDetails('rec-1', 'user-1');

    expect(result.contractId).toBe('rec-1');
    expect(result.contract.type).toBe('FIXED');
    expect(result.contract.recurrenceType).toBe('RECURRING');
    expect(result.contract.title).toBe('Academia SmartFit');
    expect(result.contract.interval).toBe(IntervalEnum.Monthly);
    expect(result.contract.amount).toBe('120.00');
    expect(result.contract.status).toBe(ContractStatusEnum.Active);
    expect(result.contract.nextChargeDate).toBe('2026-03-10');
    expect(result.recurringInfo.periodicity).toBe(IntervalEnum.Monthly);
    expect(result.recurringInfo.billingDay).toBe(10);
    expect(result.recurringInfo.account.name).toBe('Banco Inter');
    expect(result.recurringInfo.category.name).toBe('Saude');
    expect(result.recurringInfo.createdAt).toBe('2026-01-10T00:00:00.000Z');
    expect(result.occurrenceHistory.items).toHaveLength(5);
    expect(result.occurrenceHistory.items[0].status).toBe('PAID');
    expect(result.occurrenceHistory.items[0].transactionStatus).toBe('POSTED');
    expect(result.occurrenceHistory.items[4].status).toBe('FUTURE');
    expect(result.occurrenceHistory.paidLimit).toBe(3);
    expect(result.occurrenceHistory.futureLimit).toBe(3);
    expect(result.occurrenceHistory.hasMoreHistory).toBe(false);
    expect(result.financialSummary.totalPaid).toBe('240.00');
    expect(result.financialSummary.activeMonths).toBe(2);
  });

  it('throws NotFoundException when recurring contract details is not found', async () => {
    recurringContractRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      service.getRecurringContractDetails('missing-rec', 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
