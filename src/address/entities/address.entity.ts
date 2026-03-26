import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum AddressType {
  Billing  = 'billing',
  Shipping = 'shipping',
}

@Entity('address')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: AddressType })
  type: AddressType;

  @Column('varchar', { name: 'full_name', length: 200 })
  fullName: string;

  @Column('varchar', { length: 20 })
  phone: string;

  @Column('varchar', { name: 'address_line1', length: 255 })
  addressLine1: string;

  @Column('varchar', { name: 'address_line2', nullable: true, length: 255 })
  addressLine2: string | null;

  @Column('varchar', { length: 100 })
  city: string;

  @Column('varchar', { length: 100 })
  country: string;

  @Column('varchar', { name: 'postal_code', length: 20 })
  postalCode: string;

  @Column('boolean', { name: 'is_default', default: false })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
