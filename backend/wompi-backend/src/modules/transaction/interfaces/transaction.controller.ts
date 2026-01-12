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
import type {
  CreateTransactionInput,
  PayTransactionInput,
} from '../../checkout/domain/types/checkout.types';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
    private readonly payTransactionUseCase: PayTransactionUseCase,
  ) {}

  @Post()
  async createTransaction(@Body() body: CreateTransactionInput) {
    return this.createTransactionUseCase.execute(body);
  }

  @Get(':id')
  async getTransaction(@Param('id') id: string) {
    return this.getTransactionUseCase.execute(id);
  }

  @Post(':id/pay')
  async payTransaction(
    @Param('id') id: string,
    @Body() body: PayTransactionInput,
  ) {
    return this.payTransactionUseCase.execute(id, body);
  }
}
