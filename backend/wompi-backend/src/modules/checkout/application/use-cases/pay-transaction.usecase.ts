import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '@/modules/product/application/ports/product.repository.port';
import type { ProductRepositoryPort } from '@/modules/product/application/ports/product.repository.port';
import { TRANSACTION_REPOSITORY } from '@/modules/transaction/application/ports/transaction-repository.port';
import type { TransactionRepositoryPort } from '@/modules/transaction/application/ports/transaction-repository.port';
import { TransactionStatus } from '@/modules/transaction/domain/enums/transaction-status.enum';
import { PAYMENT_GATEWAY } from '@/modules/checkout/application/ports/payment-gateway.port';
import type { PaymentGatewayPort } from '@/modules/checkout/application/ports/payment-gateway.port';
import type { PayTransactionInput } from '@/modules/checkout/domain/types/checkout.types';

@Injectable()
export class PayTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(id: string, payload: PayTransactionInput) {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Only PENDING transactions can be paid.
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new ConflictException('Transaction is not pending');
    }

    // Payment credentials come from the frontend tokenization flow.
    if (
      !payload?.cardToken ||
      !payload?.acceptanceToken ||
      !payload?.acceptPersonalAuth
    ) {
      throw new ConflictException('Missing payment credentials');
    }

    // Delegate external payment processing to the gateway adapter.
    const paymentResult = await this.paymentGateway.charge({
      amount: transaction.totalAmount,
      customerEmail: transaction.customer.email,
      reference: transaction.id,
      cardToken: payload.cardToken,
      acceptanceToken: payload.acceptanceToken,
      acceptPersonalAuth: payload.acceptPersonalAuth,
    });

    if (paymentResult.success) {
      // Stock is reduced only after the payment is confirmed.
      const productId = transaction.product?.id;
      if (!productId) {
        throw new NotFoundException('Product not found');
      }

      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.availableUnits <= 0) {
        throw new ConflictException('Product out of stock');
      }

      product.availableUnits -= 1;
      await this.productRepository.save(product);

      transaction.status = TransactionStatus.SUCCESS;
      transaction.wompiReference = paymentResult.wompiReference ?? null;
      transaction.errorMessage = null;
    } else {
      transaction.status = TransactionStatus.FAILED;
      transaction.wompiReference = null;
      transaction.errorMessage =
        paymentResult.errorMessage ?? 'Payment failed';
    }

    await this.transactionRepository.save(transaction);

    return {
      transactionId: transaction.id,
      status: transaction.status,
      wompiReference: transaction.wompiReference ?? null,
      errorMessage: transaction.errorMessage ?? null,
    };
  }
}
