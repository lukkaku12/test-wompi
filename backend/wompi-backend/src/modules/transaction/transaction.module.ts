import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transaction } from './domain/entities/transaction.entity';
import { TRANSACTION_REPOSITORY } from './application/ports/transaction-repository.port';
import { TypeOrmTransactionRepository } from './infrastructure/transaction.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TypeOrmTransactionRepository,
    },
  ],
  exports: [TypeOrmModule, TRANSACTION_REPOSITORY],
})
export class TransactionModule {}
