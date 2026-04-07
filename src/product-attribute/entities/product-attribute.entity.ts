import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AttributeType } from '../enums/attribute-type.enum';
import { AttributeValue } from './attribute-value.entity';

//the category of characteristic (e.g. "Color", "Size", "Material")
@Entity('product_attribute')
export class ProductAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  name: string;

  @Column({ type: 'enum', enum: AttributeType })
  type: AttributeType;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => AttributeValue, (v) => v.attribute, { cascade: true })
  values: AttributeValue[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
