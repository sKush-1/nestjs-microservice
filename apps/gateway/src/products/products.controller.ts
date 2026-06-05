import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CurrentUser } from "../auth/current-user.decorator";
import type { UserContext } from "../auth/auth.types";
import { mapRpcErrorToHttpStatus } from "@app/rpc";
import { firstValueFrom } from "rxjs";


type Product = {
    _id: string;
    name: string;
    description: string;
    price: number;
    status: 'available' | 'unavailable';
    imageUrl?: string;
    createdByClerkUserId: string;
}
@Controller()
export class ProductHttpController {
    constructor (
        @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy
    ) {}

    @Post('products')
    async createProduct(
        @CurrentUser() user: UserContext,
        @Body() 
        body: {
            name: string;
            description: string;
            price: number
            status?: 'available' | 'unavailable';
            imageUrl?: string;
        }
    ){
            let product:Product

            const payload = {
                name: body.name,
                description: body.description,
                price: Number(body.price),
                status: body.status || 'available',
                imageUrl: body.imageUrl,
                createdByClerkUserId: user.clerkUserId
            }

            try {
                product = await firstValueFrom(this.catalogClient.send('product.create', payload));

                if (!product) {
                    console.error('Catalog service returned empty response for product.create');
                    throw new Error('Catalog service returned no product');
                }

                return product;
            } catch (error) {
                console.error('Product create failed:', error);
                mapRpcErrorToHttpStatus(error);
            }
    }
}