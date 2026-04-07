import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product_video')
export class ProductVideo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'product_id' })
  productId: string;

  @ManyToOne('Product', 'videos', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: unknown;

  @Column('varchar', { length: 500 })
  url: string;

  @Column('varchar', { length: 255, nullable: true })
  title: string | null;

  @Column('int', { name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
