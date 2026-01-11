import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Transaction } from '@/modules/transaction/domain/entities/transaction.entity';
import { TransactionRepositoryPort } from '@/modules/transaction/application/ports/transaction-repository.port';

@Injectable()
export class TypeOrmTransactionRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
  ) {}

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  create(input: Partial<Transaction>) {
    return this.repository.create(input);
  }

  save(transaction: Transaction) {
    return this.repository.save(transaction);
  }
}
