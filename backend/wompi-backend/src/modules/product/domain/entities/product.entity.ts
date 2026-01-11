import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  // Price in cents e.g (50000.00 cop)
  @Column({ type: 'int' })
  price!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string | null;

  @Column({ type: 'int', default: 0 })
  availableUnits!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}