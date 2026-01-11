import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { TRANSACTION_REPOSITORY } from '@/modules/transaction/application/ports/transaction-repository.port';
import type { TransactionRepositoryPort } from '@/modules/transaction/application/ports/transaction-repository.port';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(id: string) {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return {
      transactionId: transaction.id,
      status: transaction.status,
      totalAmount: transaction.totalAmount,
      wompiReference: transaction.wompiReference ?? null,
      errorMessage: transaction.errorMessage ?? null,
    };
  }
}
