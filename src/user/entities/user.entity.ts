import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('user')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { name: 'first_name', length: 255, default: () => "''" })
    firstName: string;

    @Column('varchar', { name: 'last_name', length: 255, default: () => "''" })
    lastName: string;

    @Column('varchar', {
        name: 'email', unique: true, length: 255, transformer: {
            to: (value: string) => value?.toLowerCase().trim(),
            from: (value: string) => value,
        }
    })
    email: string;

    @Column('varchar', { name: 'password', length: 255 })
    password: string;

    @Column('varchar', { name: 'activation_link', nullable: true, length: 255 })
    activationLink: string | null;

    @Column('boolean', { name: 'is_email_verified', default: false })
    isEmailVerified: boolean;

    @Column('varchar', { name: 'reset_password', nullable: true, length: 255 })
    resetPassword: string | null;

    @Column('varchar', { name: 'refresh_token', nullable: true, length: 255 })
    refreshToken: string | null;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
    })
    updatedAt: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamp',
        nullable: true,
    })
    deletedAt: Date;

}
