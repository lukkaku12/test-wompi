import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { CreateTransactionUseCase } from '../../checkout/application/use-cases/create-transaction.usecase';
import { GetTransactionUseCase } from '../../checkout/application/use-cases/get-transaction.usecase';
import { PayTransactionUseCase } from '../../checkout/application/use-cases/pay-transaction.usecase';

type CreateTransactionBody = {
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

type PayTransactionBody = {
  success?: boolean;
  errorMessage?: string;
};

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
    private readonly payTransactionUseCase: PayTransactionUseCase,
  ) {}

  @Post()
  async createTransaction(@Body() body: CreateTransactionBody) {
    return this.createTransactionUseCase.execute(body);
  }

  @Get(':id')
  async getTransaction(@Param('id') id: string) {
    return this.getTransactionUseCase.execute(id);
  }

  @Post(':id/pay')
  async payTransaction(
    @Param('id') id: string,
    @Body() body: PayTransactionBody,
  ) {
    return this.payTransactionUseCase.execute(id, body);
  }
}
