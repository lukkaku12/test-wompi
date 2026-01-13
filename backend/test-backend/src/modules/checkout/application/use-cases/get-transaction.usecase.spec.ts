import { GetTransactionUseCase } from './get-transaction.usecase';
import { TransactionStatus } from '@/modules/transaction/domain/enums/transaction-status.enum';

describe('GetTransactionUseCase', () => {
  it('returns NOT_FOUND when transaction does not exist', async () => {
    const useCase = new GetTransactionUseCase({
      findById: async () => null,
    } as any);

    const result = await useCase.execute('t1');

    expect(result).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Transaction not found' },
    });
  });

  it('returns transaction info', async () => {
    const useCase = new GetTransactionUseCase({
      findById: async () => ({
        id: 't1',
        status: TransactionStatus.PENDING,
        totalAmount: 1500,
        wompiReference: null,
        errorMessage: null,
      }),
    } as any);

    const result = await useCase.execute('t1');

    expect(result).toEqual({
      ok: true,
      value: {
        transactionId: 't1',
        status: TransactionStatus.PENDING,
        totalAmount: 1500,
        wompiReference: null,
        errorMessage: null,
      },
    });
  });
});
