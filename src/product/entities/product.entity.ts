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
import { ProductStatus } from '../enums/product-status.enum';
import { StockStatus } from '../enums/stock-status.enum';
import { Category } from '../../category/entities/category.entity';
import { Tag } from '../../product-tag/entities/tag.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';
import { ProductVideo } from './product-video.entity';
import { ProductBulkPrice } from './product-bulk-price.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 300, unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  price: string;

  @Column('int', { name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  //stock keeping unit
  @Column('varchar', { length: 100, unique: true })
  sku: string;

  @Column('varchar', { name: 'image_url', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @Column('uuid', { name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({
    type: 'enum',
    enum: StockStatus,
    name: 'stock_status',
    default: StockStatus.IN_STOCK,
  })
  stockStatus: StockStatus;

  @Column('decimal', { precision: 10, scale: 2, name: 'sale_price', nullable: true })
  salePrice: string | null;

  @Column({ name: 'sale_starts_at', type: 'timestamp', nullable: true })
  saleStartsAt: Date | null;

  @Column({ name: 'sale_ends_at', type: 'timestamp', nullable: true })
  saleEndsAt: Date | null;

  @ManyToMany(() => Tag, (tag) => tag.products)
  @JoinTable({
    name: 'product_tag',
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  tags: Tag[];

  @OneToMany(() => ProductVariant, (v) => v.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (i) => i.product)
  images: ProductImage[];

  @OneToMany(() => ProductVideo, (v) => v.product)
  videos: ProductVideo[];

  @OneToMany(() => ProductBulkPrice, (bp) => bp.product)
  bulkPrices: ProductBulkPrice[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
