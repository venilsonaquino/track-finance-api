import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TransactionOfxService } from 'src/transactions/transaction-ofx.service';

describe('TransactionOfxService', () => {
  let service: TransactionOfxService;
  let transactionOfxModel: any;

  beforeEach(() => {
    transactionOfxModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      destroy: jest.fn(),
    };
    service = new TransactionOfxService(transactionOfxModel as any);
  });

  it('returns null payload when ofx is missing', () => {
    const payload = service.buildPayload({} as any, 'tx-1');
    expect(payload).toBeNull();
  });

  it('builds payload when ofx has values', () => {
    const payload = service.buildPayload(
      { ofx: { fitId: 'fit-1', bankName: 'Bank' } } as any,
      'tx-1',
    );
    expect(payload).toEqual({
      transactionId: 'tx-1',
      fitId: 'fit-1',
      accountId: null,
      accountType: null,
      bankId: null,
      bankName: 'Bank',
      currency: null,
    });
  });

  it('destroys when ofx is explicitly null', async () => {
    await service.syncDetails('tx-1', { ofx: null } as any);
    expect(transactionOfxModel.destroy).toHaveBeenCalledWith({
      where: { transactionId: 'tx-1' },
      transaction: undefined,
    });
  });

  it('creates when not existing and has values', async () => {
    transactionOfxModel.findOne.mockResolvedValueOnce(null);

    await service.syncDetails('tx-1', {
      ofx: { fitId: 'fit-1', currency: 'BRL' },
    } as any);

    expect(transactionOfxModel.create).toHaveBeenCalledWith(
      {
        transactionId: 'tx-1',
        fitId: 'fit-1',
        accountId: null,
        accountType: null,
        bankId: null,
        bankName: null,
        currency: 'BRL',
      },
      { transaction: undefined },
    );
  });

  it('updates when existing', async () => {
    const existing = { update: jest.fn() };
    transactionOfxModel.findOne.mockResolvedValueOnce(existing);

    await service.syncDetails('tx-1', {
      ofx: { bankId: '001' },
    } as any);

    expect(existing.update).toHaveBeenCalledWith(
      {
        fitId: null,
        accountId: null,
        accountType: null,
        bankId: '001',
        bankName: null,
        currency: null,
      },
      { transaction: undefined },
    );
  });
});
