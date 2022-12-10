import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  RelationId,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entity/user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subTotal: number;

  @Column()
  discount: number;

  @Column()
  delivery: number;

  @Column()
  @CreateDateColumn()
  dateCreated: Date;

  @Column('simple-json')
  cartProduct: JSON;

  @ManyToOne((type) => User, (user) => user.orders, {
    eager: false,
    cascade: true,
    orphanedRowAction: 'delete',
  })
  @Exclude({ toPlainOnly: true })
  user: User;
  @Column({ default: null })
  userId: string;
}
