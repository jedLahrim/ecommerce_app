import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rating } from '../../rating/entity/rating.entity';

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  discount: number;

  @Column()
  description: string;

  @Column({ default: null })
  productImage: string;

  @Column()
  @UpdateDateColumn()
  lastUpdate: Date;

  @OneToMany((type) => Rating, (rating) => rating.product, { eager: true })
  rating: Rating[];
}
