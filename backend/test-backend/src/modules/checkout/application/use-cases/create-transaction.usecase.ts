import { Inject, Injectable } from '@nestjs/common';

import { PRODUCT_REPOSITORY } from '@/modules/product/application/ports/product.repository.port';
import type { ProductRepositoryPort } from '@/modules/product/application/ports/product.repository.port';
import { CUSTOMER_REPOSITORY } from '@/modules/customer/application/ports/customer.repository.port';
import type { CustomerRepositoryPort } from '@/modules/customer/application/ports/customer.repository.port';
import { TRANSACTION_REPOSITORY } from '@/modules/transaction/application/ports/transaction-repository.port';
import type { TransactionRepositoryPort } from '@/modules/transaction/application/ports/transaction-repository.port';
import { TransactionStatus } from '@/modules/transaction/domain/enums/transaction-status.enum';
import type {
  CreateTransactionInput,
  CheckoutError,
} from '@/modules/checkout/domain/types/checkout.types';
import { Err, Ok } from '@/modules/checkout/domain/types/result.types';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(payload: CreateTransactionInput) {
    // To create a transaction its needed to have a product and a customer mail
    if (!payload?.productId) {
      return Err<CheckoutError>({
        code: 'BAD_REQUEST',
        message: 'productId is required',
      });
    }
    if (!payload.customer?.email) {
      return Err<CheckoutError>({
        code: 'BAD_REQUEST',
        message: 'customer.email is required',
      });
    }
    const normalizedEmail = payload.customer.email.trim().toLowerCase();

    // Product availability is checked before any customer or transaction writes.
    const product = await this.productRepository.findById(payload.productId);
    if (!product) {
      return Err<CheckoutError>({
        code: 'NOT_FOUND',
        message: 'Product not found',
      });
    }
    if (product.availableUnits <= 0) {
      return Err<CheckoutError>({
        code: 'CONFLICT',
        message: 'Product out of stock',
      });
    }

    // Customer is upserted by email to keep checkout guest-based.
    const existingCustomer = await this.customerRepository.findByEmail(
      normalizedEmail,
    );
    const customer = existingCustomer
      ? this.customerRepository.merge(existingCustomer, {
          ...payload.customer,
          email: normalizedEmail,
        })
      : this.customerRepository.create({
          ...payload.customer,
          email: normalizedEmail,
        });

    try {
      await this.customerRepository.save(customer);
    } catch (error: unknown) {
      const maybeError = error as { code?: string };
      if (maybeError?.code !== '23505') {
        throw error;
      }

      const retryCustomer = await this.customerRepository.findByEmail(
        normalizedEmail,
      );
      if (!retryCustomer) {
        throw error;
      }
      await this.customerRepository.save(
        this.customerRepository.merge(retryCustomer, {
          ...payload.customer,
          email: normalizedEmail,
        }),
      );
    }

    // Fees are treated as optional and default to 0.
    const baseFee = Number(payload.baseFee ?? 0);
    const deliveryFee = Number(payload.deliveryFee ?? 0);

    if (Number.isNaN(baseFee) || Number.isNaN(deliveryFee)) {
      return Err<CheckoutError>({
        code: 'BAD_REQUEST',
        message: 'baseFee and deliveryFee must be numbers',
      });
    }

    const amount = product.price;
    const totalAmount = amount + baseFee + deliveryFee;

    // Transaction starts in PENDING until payment confirms.
    const transaction = this.transactionRepository.create({
      product,
      customer,
      status: TransactionStatus.PENDING,
      amount,
      baseFee,
      deliveryFee,
      totalAmount,
    });

    await this.transactionRepository.save(transaction);

    return Ok({
      transactionId: transaction.id,
      status: transaction.status,
      totalAmount: transaction.totalAmount,
    });
  }
}
