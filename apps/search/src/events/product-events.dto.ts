import { Product } from "apps/catalog/src/products/product.schema";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";


export class ProductCreatedDto {
    @IsString()
    productId: string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsEnum(['available', 'unavailable', 'discontinued'])
    status: Product['status']

    @IsNumber()
    price: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsString()
    createdByClerkUserId: string;

}