import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PRODUCT_REPOSITORY } from '@/modules/product/application/ports/product.repository.port';
import type { ProductRepositoryPort } from '@/modules/product/application/ports/product.repository.port';
import { CUSTOMER_REPOSITORY } from '@/modules/customer/application/ports/customer.repository.port';
import type { CustomerRepositoryPort } from '@/modules/customer/application/ports/customer.repository.port';
import { TRANSACTION_REPOSITORY } from '@/modules/transaction/application/ports/transaction-repository.port';
import type { TransactionRepositoryPort } from '@/modules/transaction/application/ports/transaction-repository.port';
import { TransactionStatus } from '@/modules/transaction/domain/enums/transaction-status.enum';

type CreateTransactionInput = {
  productId: string;
  baseFee?: number;
  deliveryFee?: number;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  };
};

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
      throw new BadRequestException('productId is required');
    }
    if (!payload.customer?.email) {
      throw new BadRequestException('customer.email is required');
    }

    // Product availability is checked before any customer or transaction writes.
    const product = await this.productRepository.findById(payload.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.availableUnits <= 0) {
      throw new ConflictException('Product out of stock');
    }

    // Customer is upserted by email to keep checkout guest-based.
    const existingCustomer = await this.customerRepository.findByEmail(
      payload.customer.email,
    );
    const customer = existingCustomer
      ? this.customerRepository.merge(existingCustomer, payload.customer)
      : this.customerRepository.create(payload.customer);
    await this.customerRepository.save(customer);

    // Fees are treated as optional and default to 0.
    const baseFee = Number(payload.baseFee ?? 0);
    const deliveryFee = Number(payload.deliveryFee ?? 0);

    if (Number.isNaN(baseFee) || Number.isNaN(deliveryFee)) {
      throw new BadRequestException('baseFee and deliveryFee must be numbers');
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

    return {
      transactionId: transaction.id,
      status: transaction.status,
      totalAmount: transaction.totalAmount,
    };
  }
}
