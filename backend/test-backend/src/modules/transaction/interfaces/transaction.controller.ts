import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

import { CreateTransactionUseCase } from '../../checkout/application/use-cases/create-transaction.usecase';
import { GetTransactionUseCase } from '../../checkout/application/use-cases/get-transaction.usecase';
import { PayTransactionUseCase } from '../../checkout/application/use-cases/pay-transaction.usecase';
import type {
  CheckoutError,
  CreateTransactionInput,
  PayTransactionInput,
} from '../../checkout/domain/types/checkout.types';
import type { Result } from '../../checkout/domain/types/result.types';
// Type guard used to narrow the Result type returned by use cases.
// It allows the controller to clearly separate the success path (HTTP 2xx)
// from the error path (mapped to HTTP exceptions), without throwing inside the use case.
const isOk = <Ok, Err>(result: Result<Ok, Err>): result is { ok: true; value: Ok } => result.ok;
// Translates domain-level errors into HTTP-specific exceptions.
// Use cases return structured domain errors instead of throwing HTTP errors directly,
// keeping the application layer framework-agnostic and testable.
const throwHttpError = (error: CheckoutError): never => {
  switch (error.code) {
    case 'BAD_REQUEST':
      throw new BadRequestException(error.message);
    case 'NOT_FOUND':
      throw new NotFoundException(error.message);
    case 'CONFLICT':
      throw new ConflictException(error.message);
    default:
      throw new ConflictException(error.message);
  }
};

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
    private readonly payTransactionUseCase: PayTransactionUseCase,
  ) {}

  @Post()
  async createTransaction(@Body() body: CreateTransactionInput) {
    const result = await this.createTransactionUseCase.execute(body);
    if (!isOk(result)) {
      return throwHttpError(result.error);
    }
    return result.value;
  }

  @Get(':id')
  async getTransaction(@Param('id') id: string) {
    const result = await this.getTransactionUseCase.execute(id);
    if (!isOk(result)) {
      return throwHttpError(result.error);
    }
    return result.value;
  }

  @Post(':id/pay')
  async payTransaction(
    @Param('id') id: string,
    @Body() body: PayTransactionInput,
  ) {
    const result = await this.payTransactionUseCase.execute(id, body);
    if (!isOk(result)) {
      return throwHttpError(result.error);
    }
    return result.value;
  }
}
