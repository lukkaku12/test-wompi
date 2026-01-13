import { CreateTransactionUseCase } from './create-transaction.usecase';
import { TransactionStatus } from '@/modules/transaction/domain/enums/transaction-status.enum';

describe('CreateTransactionUseCase', () => {
  const baseCustomer = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '3000000000',
    address: 'Street 123',
    city: 'Bogota',
  };

  const buildUseCase = (overrides?: {
    productRepository?: unknown;
    customerRepository?: unknown;
    transactionRepository?: unknown;
  }) => {
    const productRepository = overrides?.productRepository ?? {
      findById: async () => ({ id: 'p1', price: 1000, availableUnits: 5 }),
    };
    const customerRepository = overrides?.customerRepository ?? {
      findByEmail: async () => null,
      create: (d: any) => ({ id: 'c1', ...d }),
      merge: (_e: any, d: any) => d,
      save: (d: any) => d,
    };
    const transactionRepository = overrides?.transactionRepository ?? {
      create: (d: any) => ({ id: 't1', ...d }),
      save: (d: any) => d,
    };

    return new CreateTransactionUseCase(
      productRepository as any,
      customerRepository as any,
      transactionRepository as any,
    );
  };

  it('returns BAD_REQUEST when productId is missing', async () => {
    const useCase = buildUseCase();
    const result = await useCase.execute({ customer: baseCustomer } as any);

    expect(result).toEqual({
      ok: false,
      error: { code: 'BAD_REQUEST', message: 'productId is required' },
    });
  });

  it('returns BAD_REQUEST when customer email is missing', async () => {
    const useCase = buildUseCase();
    const result = await useCase.execute({
      productId: 'p1',
      customer: { ...baseCustomer, email: '' },
    } as any);

    expect(result).toEqual({
      ok: false,
      error: { code: 'BAD_REQUEST', message: 'customer.email is required' },
    });
  });

  it('returns NOT_FOUND when product is missing', async () => {
    const useCase = buildUseCase({
      productRepository: { findById: async () => null },
    });

    const result = await useCase.execute({
      productId: 'p1',
      customer: baseCustomer,
    } as any);

    expect(result).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Product not found' },
    });
  });

  it('returns CONFLICT when product is out of stock', async () => {
    const useCase = buildUseCase({
      productRepository: {
        findById: async () => ({ id: 'p1', price: 1000, availableUnits: 0 }),
      },
    });

    const result = await useCase.execute({
      productId: 'p1',
      customer: baseCustomer,
    } as any);

    expect(result).toEqual({
      ok: false,
      error: { code: 'CONFLICT', message: 'Product out of stock' },
    });
  });

  it('creates customer and transaction', async () => {
    const useCase = buildUseCase();

    const result = await useCase.execute({
      productId: 'p1',
      baseFee: 100,
      deliveryFee: 200,
      customer: baseCustomer,
    } as any);

    expect(result).toEqual({
      ok: true,
      value: {
        transactionId: 't1',
        status: TransactionStatus.PENDING,
        totalAmount: 1300,
      },
    });
  });

  it('updates existing customer', async () => {
    const existingCustomer = { id: 'c1', email: baseCustomer.email };

    const customerRepo = {
      findByEmail: async () => existingCustomer,
      create: () => {
        throw new Error('should not create');
      },
      merge: (_e: any, d: any) => ({ ...existingCustomer, ...d }),
      save: (d: any) => d,
    } as any;

    const transactionRepo = {
      create: (d: any) => ({ id: 't2', ...d }),
      save: (d: any) => d,
    } as any;

    const useCase = buildUseCase({
      productRepository: {
        findById: async () => ({ id: 'p1', price: 1500, availableUnits: 5 }),
      },
      customerRepository: customerRepo,
      transactionRepository: transactionRepo,
    });

    const result = await useCase.execute({
      productId: 'p1',
      customer: baseCustomer,
    } as any);

    if (!result.ok) {
      throw new Error('Expected ok result');
    }
    expect(result.value.transactionId).toBe('t2');
  });
});
