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
import { ProductAttribute } from './product-attribute.entity';

//the allowed options within that attribute(Color : "Red", "Blue", "Green")
@Entity('attribute_value')
@Unique(['attributeId', 'value'])
export class AttributeValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'attribute_id' })
  attributeId: string;

  @ManyToOne(() => ProductAttribute, (a) => a.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: ProductAttribute;

  @Column('varchar', { length: 200 })
  value: string;

  @Column('int', { name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
