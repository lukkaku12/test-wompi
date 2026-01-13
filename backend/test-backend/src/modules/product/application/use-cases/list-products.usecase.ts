import { Inject, Injectable } from '@nestjs/common';

import { PRODUCT_REPOSITORY } from '@/modules/product/application/ports/product.repository.port';
import type { ProductRepositoryPort } from '@/modules/product/application/ports/product.repository.port';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute() {
    return this.productRepository.findAll();
  }
}
