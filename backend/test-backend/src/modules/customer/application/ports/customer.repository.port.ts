import { Customer } from '../../domain/entities/customer.entity';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepositoryPort {
  findByEmail(email: string): Promise<Customer | null>;
  create(input: Partial<Customer>): Customer;
  merge(existing: Customer, input: Partial<Customer>): Customer;
  save(customer: Customer): Promise<Customer>;
}
