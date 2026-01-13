import { Inject, Injectable } from '@nestjs/common';

import { TRANSACTION_REPOSITORY } from '@/modules/transaction/application/ports/transaction-repository.port';
import type { TransactionRepositoryPort } from '@/modules/transaction/application/ports/transaction-repository.port';
import type { CheckoutError } from '@/modules/checkout/domain/types/checkout.types';
import { Err, Ok } from '@/modules/checkout/domain/types/result.types';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(id: string) {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      return Err<CheckoutError>({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }

    return Ok({
      transactionId: transaction.id,
      status: transaction.status,
      totalAmount: transaction.totalAmount,
      wompiReference: transaction.wompiReference ?? null,
      errorMessage: transaction.errorMessage ?? null,
    });
  }
}
