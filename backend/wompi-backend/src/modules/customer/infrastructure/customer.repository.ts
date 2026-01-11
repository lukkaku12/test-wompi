import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Customer } from '../domain/entities/customer.entity';
import { CustomerRepositoryPort } from '../application/ports/customer.repository.port';

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepositoryPort {
  constructor(
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email } });
  }

  create(input: Partial<Customer>) {
    return this.repository.create(input);
  }

  merge(existing: Customer, input: Partial<Customer>) {
    return this.repository.merge(existing, input);
  }

  save(customer: Customer) {
    return this.repository.save(customer);
  }
}
