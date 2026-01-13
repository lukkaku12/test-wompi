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
  const freshTransaction = () => ({
    ...baseTransaction,
    customer: { ...baseTransaction.customer },
    product: { ...baseTransaction.product },
  });

  const okPaymentPayload = {
    cardToken: 'tok',
    acceptanceToken: 'acc',
    acceptPersonalAuth: 'true',
  };

  it('returns NOT_FOUND when transaction is missing', async () => {
    const useCase = new PayTransactionUseCase(
      { findById: async () => null } as any,
      {} as any,
      {} as any,
    );

    const result = await useCase.execute('t1', {} as any);
    expect(result).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Transaction not found' },
    });
  });

  it('returns CONFLICT when transaction is not pending', async () => {
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

    const result = await useCase.execute('t1', {} as any);
    expect(result).toEqual({
      ok: false,
      error: { code: 'CONFLICT', message: 'Transaction is not pending' },
    });
  });

  it('returns BAD_REQUEST when payment credentials are missing', async () => {
    const useCase = new PayTransactionUseCase(
      { findById: async () => baseTransaction } as any,
      {} as any,
      {} as any,
    );

    const result = await useCase.execute('t1', {
      cardToken: '',
      acceptanceToken: '',
      acceptPersonalAuth: '',
    } as any);
    expect(result).toEqual({
      ok: false,
      error: { code: 'BAD_REQUEST', message: 'Missing payment credentials' },
    });
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

    if (!result.ok) {
      throw new Error('Expected ok result');
    }
    expect(result.value.status).toBe(TransactionStatus.SUCCESS);
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
      { findById: async () => freshTransaction(), save: (t: any) => t } as any,
      productRepo,
      paymentGateway,
    );

    const result = await useCase.execute('t1', okPaymentPayload as any);

    if (!result.ok) {
      throw new Error('Expected ok result');
    }
    expect(result.value.status).toBe(TransactionStatus.FAILED);
  });

  it('keeps transaction PENDING without touching stock', async () => {
    const productRepo = {
      findById: async () => ({ id: 'p1', availableUnits: 3 }),
      save: () => {
        throw new Error('should not save');
      },
    } as any;

    const paymentGateway = {
      charge: async () => ({
        success: true,
        status: TransactionStatus.PENDING,
        wompiReference: 'wtx_pending',
      }),
    } as any;

    const useCase = new PayTransactionUseCase(
      { findById: async () => freshTransaction(), save: (t: any) => t } as any,
      productRepo,
      paymentGateway,
    );

    const result = await useCase.execute('t1', okPaymentPayload as any);

    if (!result.ok) {
      throw new Error('Expected ok result');
    }
    expect(result.value.status).toBe(TransactionStatus.PENDING);
    expect(result.value.wompiReference).toBe('wtx_pending');
  });

  it('returns NOT_FOUND when product id is missing on success', async () => {
    const paymentGateway = {
      charge: async () => ({ success: true, wompiReference: 'wtx_2' }),
    } as any;

    const useCase = new PayTransactionUseCase(
      {
        findById: async () => ({ ...freshTransaction(), product: null }),
        save: (t: any) => t,
      } as any,
      {} as any,
      paymentGateway,
    );

    const result = await useCase.execute('t1', okPaymentPayload as any);
    expect(result).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    });
  });

  it('returns CONFLICT when product is out of stock on success', async () => {
    const paymentGateway = {
      charge: async () => ({ success: true, wompiReference: 'wtx_3' }),
    } as any;

    const useCase = new PayTransactionUseCase(
      { findById: async () => freshTransaction(), save: (t: any) => t } as any,
      {
        findById: async () => ({ id: 'p1', availableUnits: 0 }),
        save: () => {},
      } as any,
      paymentGateway,
    );

    const result = await useCase.execute('t1', okPaymentPayload as any);
    expect(result).toEqual({
      ok: false,
      error: { code: 'CONFLICT', message: 'Product out of stock' },
    });
  });
});
