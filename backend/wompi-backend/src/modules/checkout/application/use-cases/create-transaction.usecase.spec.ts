import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { CreateTransactionUseCase } from './create-transaction.usecase';
import { TransactionStatus } from '@/modules/transaction/domain/enums/transaction-status.enum';

describe('CreateTransactionUseCase', () => {
  const baseCustomer = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '3000000000',
    address: 'Street 123',
    city: 'Bogota',
  };

  it('throws when productId is missing', async () => {
    const useCase = new CreateTransactionUseCase(
      {
        findById: async () => ({ id: 'p1', price: 1000, availableUnits: 5 }),
      } as any,
      { findByEmail: async () => null } as any,
      { create: (d: any) => ({ id: 't1', ...d }), save: (d: any) => d } as any,
    );

    await expect(
      useCase.execute({ customer: baseCustomer } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when customer email is missing', async () => {
    const useCase = new CreateTransactionUseCase(
      {
        findById: async () => ({ id: 'p1', price: 1000, availableUnits: 5 }),
      } as any,
      { findByEmail: async () => null } as any,
      { create: (d: any) => ({ id: 't1', ...d }), save: (d: any) => d } as any,
    );

    await expect(
      useCase.execute({
        productId: 'p1',
        customer: { ...baseCustomer, email: '' },
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when product is not found', async () => {
    const useCase = new CreateTransactionUseCase(
      { findById: async () => null } as any,
      { findByEmail: async () => null } as any,
      { create: (d: any) => ({ id: 't1', ...d }), save: (d: any) => d } as any,
    );

    await expect(
      useCase.execute({
        productId: 'p1',
        customer: baseCustomer,
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when product is out of stock', async () => {
    const useCase = new CreateTransactionUseCase(
      {
        findById: async () => ({ id: 'p1', price: 1000, availableUnits: 0 }),
      } as any,
      { findByEmail: async () => null } as any,
      { create: (d: any) => ({ id: 't1', ...d }), save: (d: any) => d } as any,
    );

    await expect(
      useCase.execute({
        productId: 'p1',
        customer: baseCustomer,
      } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates customer and transaction', async () => {
    const customerRepo = {
      findByEmail: async () => null,
      create: (d: any) => ({ id: 'c1', ...d }),
      save: (d: any) => d,
    } as any;

    const transactionRepo = {
      create: (d: any) => ({ id: 't1', ...d }),
      save: (d: any) => d,
    } as any;

    const useCase = new CreateTransactionUseCase(
      {
        findById: async () => ({ id: 'p1', price: 1000, availableUnits: 5 }),
      } as any,
      customerRepo,
      transactionRepo,
    );

    const result = await useCase.execute({
      productId: 'p1',
      baseFee: 100,
      deliveryFee: 200,
      customer: baseCustomer,
    } as any);

    expect(result).toEqual({
      transactionId: 't1',
      status: TransactionStatus.PENDING,
      totalAmount: 1300,
    });
  });

  it('updates existing customer', async () => {
    const existingCustomer = { id: 'c1', email: baseCustomer.email };

    const customerRepo = {
      findByEmail: async () => existingCustomer,
      create: () => {
        throw new Error('should not create');
      },
      merge: (_e: any, d: any) => ({ ...existingCustomer, ...d }),
      save: (d: any) => d,
    } as any;

    const transactionRepo = {
      create: (d: any) => ({ id: 't2', ...d }),
      save: (d: any) => d,
    } as any;

    const useCase = new CreateTransactionUseCase(
      {
        findById: async () => ({ id: 'p1', price: 1500, availableUnits: 5 }),
      } as any,
      customerRepo,
      transactionRepo,
    );

    const result = await useCase.execute({
      productId: 'p1',
      customer: baseCustomer,
    } as any);

    expect(result.transactionId).toBe('t2');
  });
});
