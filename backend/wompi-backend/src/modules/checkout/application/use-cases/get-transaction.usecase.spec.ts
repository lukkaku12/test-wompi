import { NotFoundException } from '@nestjs/common';

import { GetTransactionUseCase } from './get-transaction.usecase';
import { TransactionStatus } from '@/modules/transaction/domain/enums/transaction-status.enum';

describe('GetTransactionUseCase', () => {
  it('throws when transaction does not exist', async () => {
    const useCase = new GetTransactionUseCase({
      findById: async () => null,
    } as any);

    await expect(useCase.execute('t1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
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
      transactionId: 't1',
      status: TransactionStatus.PENDING,
      totalAmount: 1500,
      wompiReference: null,
      errorMessage: null,
    });
  });
});
