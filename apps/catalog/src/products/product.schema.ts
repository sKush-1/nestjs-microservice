import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ProductDocument = HydratedDocument<Product>;
export type ProductStatus = 'available' | 'unavailable' | 'discontinued';

@Schema()
export class Product {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true, enum: ['available', 'unavailable', 'discontinued'], default: 'available' })
    status: ProductStatus;

    @Prop({ required: false })
    imageUrl?: string;

    @Prop({ required: true })
    createdByClerkUserId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
