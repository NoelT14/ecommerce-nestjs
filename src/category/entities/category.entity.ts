import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';

@Entity('category')
@Tree('materialized-path')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 300, unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('varchar', { name: 'image_url', length: 500, nullable: true })
  imageUrl: string | null;

  @Column('int', { name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  //nese parent fshihet ,all children deleted 
  @TreeParent({ onDelete: 'CASCADE' })
  parent: Category | null;

  @TreeChildren()
  children: Category[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
