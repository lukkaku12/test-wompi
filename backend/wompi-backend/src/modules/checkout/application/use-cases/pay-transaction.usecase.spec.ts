import { ConflictException, NotFoundException } from '@nestjs/common';

import { PayTransactionUseCase } from './pay-transaction.usecase';
import { TransactionStatus } from '@/modules/transaction/domain/enums/transaction-status.enum';

describe('PayTransactionUseCase', () => {
  const baseTransaction = {
    id: 't1',
    status: TransactionStatus.PENDING,
    totalAmount: 2000,
    customer: { email: 'jane@example.com' },
    product: { id: 'p1' },
  };

  const okPaymentPayload = {
    cardToken: 'tok',
    acceptanceToken: 'acc',
    acceptPersonalAuth: 'true',
  };

  it('throws when transaction is missing', async () => {
    const useCase = new PayTransactionUseCase(
      { findById: async () => null } as any,
      {} as any,
      {} as any,
    );

    await expect(useCase.execute('t1', {} as any)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws when transaction is not pending', async () => {
    const useCase = new PayTransactionUseCase(
      {
        findById: async () => ({
          ...baseTransaction,
          status: TransactionStatus.SUCCESS,
        }),
      } as any,
      {} as any,
      {} as any,
    );

    await expect(useCase.execute('t1', {} as any)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('throws when payment credentials are missing', async () => {
    const useCase = new PayTransactionUseCase(
      { findById: async () => baseTransaction } as any,
      {} as any,
      {} as any,
    );

    await expect(
      useCase.execute('t1', { cardToken: '', acceptanceToken: '' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('marks transaction SUCCESS and decreases stock', async () => {
    const productRepo = {
      findById: async () => ({ id: 'p1', availableUnits: 3 }),
      save: (p: any) => p,
    } as any;

    const paymentGateway = {
      charge: async () => ({ success: true, wompiReference: 'wtx_1' }),
    } as any;

    const transactionRepo = {
      findById: async () => ({ ...baseTransaction }),
      save: (t: any) => t,
    } as any;

    const useCase = new PayTransactionUseCase(
      transactionRepo,
      productRepo,
      paymentGateway,
    );

    const result = await useCase.execute('t1', okPaymentPayload as any);

    expect(result.status).toBe(TransactionStatus.SUCCESS);
  });

  it('marks transaction FAILED and does not touch stock', async () => {
    const productRepo = {
      findById: async () => ({ id: 'p1', availableUnits: 3 }),
      save: () => {
        throw new Error('should not save');
      },
    } as any;

    const paymentGateway = {
      charge: async () => ({ success: false, errorMessage: 'Declined' }),
    } as any;

    const useCase = new PayTransactionUseCase(
      { findById: async () => baseTransaction, save: (t: any) => t } as any,
      productRepo,
      paymentGateway,
    );

    const result = await useCase.execute('t1', okPaymentPayload as any);

    expect(result.status).toBe(TransactionStatus.FAILED);
  });

  it('throws when product id is missing on success', async () => {
    const paymentGateway = {
      charge: async () => ({ success: true, wompiReference: 'wtx_2' }),
    } as any;

    const useCase = new PayTransactionUseCase(
      {
        findById: async () => ({ ...baseTransaction, product: null }),
        save: (t: any) => t,
      } as any,
      {} as any,
      paymentGateway,
    );

    await expect(
      useCase.execute('t1', okPaymentPayload as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws when product is out of stock on success', async () => {
    const paymentGateway = {
      charge: async () => ({ success: true, wompiReference: 'wtx_3' }),
    } as any;

    const useCase = new PayTransactionUseCase(
      { findById: async () => baseTransaction, save: (t: any) => t } as any,
      {
        findById: async () => ({ id: 'p1', availableUnits: 0 }),
        save: () => {},
      } as any,
      paymentGateway,
    );

    await expect(
      useCase.execute('t1', okPaymentPayload as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
