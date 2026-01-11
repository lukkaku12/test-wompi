import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Customer } from './domain/entities/customer.entity';
import { CUSTOMER_REPOSITORY } from './application/ports/customer.repository.port';
import { TypeOrmCustomerRepository } from './infrastructure/customer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: TypeOrmCustomerRepository,
    },
  ],
  exports: [TypeOrmModule, CUSTOMER_REPOSITORY],
})
export class CustomerModule {}
