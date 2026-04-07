import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product_image')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'product_id' })
  productId: string;

  @ManyToOne('Product', 'images', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: unknown;

  @Column('uuid', { name: 'variant_id', nullable: true })
  variantId: string | null;

  @ManyToOne('ProductVariant', 'images', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: unknown | null;

  @Column('varchar', { length: 500 })
  url: string;

  @Column('varchar', { name: 'alt_text', length: 255, nullable: true })
  altText: string | null;

  @Column('boolean', { name: 'is_cover', default: false })
  isCover: boolean;

  @Column('int', { name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
