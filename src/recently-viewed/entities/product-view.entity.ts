import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('product_view')
@Unique(['userId', 'productId'])
export class ProductView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid', { name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'viewed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  viewedAt: Date;
}
