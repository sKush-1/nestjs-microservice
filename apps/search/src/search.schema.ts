import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type SearchProductDocument = HydratedDocument<SearchProduct>;

@Schema()
export class SearchProduct {

    @Prop({ required: true, unique: true, index: true })
    productId: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    normalizedText: string;

    @Prop({ required: true, enum: ['available', 'unavailable', 'discontinued'] })
    status: "available" | "unavailable" | "discontinued";

    @Prop({ required: true })
    price: number;

    @Prop()
    imageUrl?: string;

    @Prop({ required: true })
    createdByClerkUserId: string;
}

export const SearchProductSchema = SchemaFactory.createForClass(SearchProduct)
