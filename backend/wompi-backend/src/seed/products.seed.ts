import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '@/app.module';
import { Product } from '@/modules/product/domain/entities/product.entity';

type SeedProduct = Pick<
  Product,
  'name' | 'description' | 'price' | 'imageUrl' | 'availableUnits'
>;

const seedProducts: SeedProduct[] = [
  {
    name: 'Hootsi Classic Burger',
    description:
      'Beef patty, cheddar, house pickles, caramelized onion, and garlic mayo.',
    price: 32000,
    imageUrl: 'https://picsum.photos/seed/hootsi-classic/600/400',
    availableUnits: 120,
  },
  {
    name: 'Hootsi Crispy Chicken',
    description:
      'Buttermilk fried chicken, slaw, spicy aioli, and toasted brioche.',
    price: 29500,
    imageUrl: 'https://picsum.photos/seed/hootsi-chicken/600/400',
    availableUnits: 90,
  },
  {
    name: 'Smoky BBQ Stack',
    description:
      'Double beef, smoked bacon, cheddar, onion rings, and BBQ sauce.',
    price: 42000,
    imageUrl: 'https://picsum.photos/seed/hootsi-bbq/600/400',
    availableUnits: 80,
  },
  {
    name: 'Andean Veggie Melt',
    description:
      'Grilled portobello, roasted peppers, provolone, and basil pesto.',
    price: 28000,
    imageUrl: 'https://picsum.photos/seed/hootsi-veggie/600/400',
    availableUnits: 70,
  },
  {
    name: 'Patacon Crunch',
    description:
      'Crispy patacon base, shredded beef, avocado cream, and pico de gallo.',
    price: 26000,
    imageUrl: 'https://picsum.photos/seed/hootsi-patacon/600/400',
    availableUnits: 60,
  },
  {
    name: 'Coastal Fish Sandwich',
    description:
      'Beer-battered fish, lime slaw, and tartar sauce on sesame bun.',
    price: 31000,
    imageUrl: 'https://picsum.photos/seed/hootsi-fish/600/400',
    availableUnits: 65,
  },
  {
    name: 'Truffle Fries',
    description: 'Crispy fries tossed with truffle oil and parmesan.',
    price: 14000,
    imageUrl: 'https://picsum.photos/seed/hootsi-fries/600/400',
    availableUnits: 200,
  },
  {
    name: 'Guava Glaze Wings',
    description: 'Sticky guava glaze wings with toasted sesame.',
    price: 22000,
    imageUrl: 'https://picsum.photos/seed/hootsi-wings/600/400',
    availableUnits: 110,
  },
  {
    name: 'Mango Lime Lemonade',
    description: 'Fresh mango puree with lime and sparkling lemonade.',
    price: 9000,
    imageUrl: 'https://picsum.photos/seed/hootsi-lemonade/600/400',
    availableUnits: 160,
  },
  {
    name: 'Cold Brew Tonic',
    description: 'Cold brew coffee topped with citrus tonic and orange peel.',
    price: 11000,
    imageUrl: 'https://picsum.photos/seed/hootsi-coldbrew/600/400',
    availableUnits: 140,
  },
  {
    name: 'Choco Salted Shake',
    description: 'Chocolate shake with sea salt caramel drizzle.',
    price: 15000,
    imageUrl: 'https://picsum.photos/seed/hootsi-shake/600/400',
    availableUnits: 130,
  },
  {
    name: 'Aji Pineapple Salad',
    description: 'Pineapple, mixed greens, and aji-lime vinaigrette.',
    price: 18000,
    imageUrl: 'https://picsum.photos/seed/hootsi-salad/600/400',
    availableUnits: 75,
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const repository = dataSource.getRepository(Product);

    const existingNames = new Set(
      (
        await repository.find({
          select: ['name'],
        })
      ).map((product) => product.name),
    );

    const toInsert = seedProducts.filter(
      (product) => !existingNames.has(product.name),
    );

    if (toInsert.length === 0) {
      // No-op if already seeded
      return;
    }

    await repository.insert(toInsert);
  } finally {
    await app.close();
  }
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Product seed failed:', error);
  process.exitCode = 1;
});
