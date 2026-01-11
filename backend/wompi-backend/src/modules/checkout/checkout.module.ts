import { Module } from '@nestjs/common';
import { CheckoutController } from './interfaces/checkout.controller';

import { ProductModule } from '@/modules/product/product.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { TransactionModule } from '@/modules/transaction/transaction.module';

@Module({
  imports: [
    ProductModule,
    CustomerModule,
    TransactionModule,
  ],
  controllers: [CheckoutController],
  providers: [],
  exports: [],
})
export class CheckoutModule {}
