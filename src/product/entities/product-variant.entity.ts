import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StockStatus } from '../enums/stock-status.enum';
import { AttributeValue } from '../../product-attribute/entities/attribute-value.entity';

@Entity('product_variant')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'product_id' })
  productId: string;

  @ManyToOne('Product', 'variants', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: unknown;

  @Column('varchar', { length: 100, unique: true })
  sku: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: string | null;

  @Column('int', { name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @Column({
    type: 'enum',
    enum: StockStatus,
    name: 'stock_status',
    default: StockStatus.IN_STOCK,
  })
  stockStatus: StockStatus;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @Column('int', { name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToMany(() => AttributeValue)
  @JoinTable({
    name: 'variant_attribute_value',
    joinColumn: { name: 'variant_id' },
    inverseJoinColumn: { name: 'attribute_value_id' },
  })
  attributeValues: AttributeValue[];

  @OneToMany('ProductImage', 'variant')
  images: unknown[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
