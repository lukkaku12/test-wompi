import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../domain/entities/product.entity';
import { ProductRepositoryPort } from '../application/ports/product.repository.port';

@Injectable()
export class TypeOrmProductRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  findAll() {
    return this.repository.find();
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  save(product: Product) {
    return this.repository.save(product);
  }
}
