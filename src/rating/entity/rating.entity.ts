import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import { Product } from "../../product/entity/product.entity";

@Entity()
export class Rating extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    rating: number;

    @Column()
    userId: number;

    @ManyToOne(type => Product, product => product.rating, { eager: false })
    product: Product;

    @Column()
    productId: number;
}
