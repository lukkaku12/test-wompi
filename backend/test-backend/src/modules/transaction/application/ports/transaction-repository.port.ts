import { Transaction } from '../../domain/entities/transaction.entity';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface TransactionRepositoryPort {
  findById(id: string): Promise<Transaction | null>;
  create(input: Partial<Transaction>): Transaction;
  save(transaction: Transaction): Promise<Transaction>;
}
