import { ListProductsUseCase } from './list-products.usecase';

describe('ListProductsUseCase', () => {
  it('returns products from repository', async () => {
    const products = [{ id: 'p1' }, { id: 'p2' }];

    const productRepository = {
      findAll: async () => products,
    } as any;

    const useCase = new ListProductsUseCase(productRepository);

    const result = await useCase.execute();

    expect(result).toEqual(products);
  });
});
