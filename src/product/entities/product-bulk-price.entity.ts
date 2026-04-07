import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product_bulk_price')
@Unique(['productId', 'minQuantity'])
export class ProductBulkPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'product_id' })
  productId: string;

  @ManyToOne('Product', 'bulkPrices', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: unknown;

  @Column('int', { name: 'min_quantity' })
  minQuantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
