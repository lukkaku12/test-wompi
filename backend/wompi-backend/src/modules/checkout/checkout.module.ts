import { Module } from '@nestjs/common';
import { CheckoutController } from './interfaces/checkout.controller';
import { TransactionsController } from '../transaction/interfaces/transaction.controller';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.usecase';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.usecase';
import { PayTransactionUseCase } from './application/use-cases/pay-transaction.usecase';
import { PAYMENT_GATEWAY } from './application/ports/payment-gateway.port';
import { FakeWompiGateway } from './infrastructure/fake-wompi.gateway';

import { ProductModule } from '@/modules/product/product.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { TransactionModule } from '@/modules/transaction/transaction.module';

@Module({
  imports: [
    ProductModule,
    CustomerModule,
    TransactionModule,
  ],
  controllers: [CheckoutController, TransactionsController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionUseCase,
    PayTransactionUseCase,
    {
      provide: PAYMENT_GATEWAY,
      useClass: FakeWompiGateway,
    },
  ],
  exports: [],
})
export class CheckoutModule {}
