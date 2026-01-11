import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '@/modules/product/domain/entities/product.entity';
import { Customer } from '@/modules/customer/domain/entities/customer.entity';
import { TransactionStatus } from '@/modules/transaction/domain/enums/transaction-status.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Product, { eager: true, onDelete: 'RESTRICT' })
  product!: Product;

  @ManyToOne(() => Customer, { eager: true, onDelete: 'RESTRICT' })
  customer!: Customer;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  // product.price
  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'int' })
  baseFee!: number;

  @Column({ type: 'int' })
  deliveryFee!: number;

  @Column({ type: 'int' })
  totalAmount!: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  wompiReference?: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  errorMessage?: string | null;

  @Column({ type: 'varchar', length: 4, nullable: true })
  cardLast4?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}