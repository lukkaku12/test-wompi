import { Controller, Get } from '@nestjs/common';

import { ListProductsUseCase } from '../application/use-cases/list-products.usecase';

@Controller('products')
export class ProductController {
  constructor(private readonly listProductsUseCase: ListProductsUseCase) {}

  @Get()
  async listProducts() {
    return this.listProductsUseCase.execute();
  }
}
