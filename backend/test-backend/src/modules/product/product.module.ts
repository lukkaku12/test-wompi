import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from './domain/entities/product.entity';
import { ProductController } from './interfaces/product.controller';
import { ListProductsUseCase } from './application/use-cases/list-products.usecase';
import { PRODUCT_REPOSITORY } from './application/ports/product.repository.port';
import { TypeOrmProductRepository } from './infrastructure/product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [
    ListProductsUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: TypeOrmProductRepository,
    },
  ],
  exports: [TypeOrmModule, PRODUCT_REPOSITORY],
})
export class ProductModule {}
