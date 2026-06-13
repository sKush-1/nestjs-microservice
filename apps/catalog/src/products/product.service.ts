import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product, ProductDocument } from "./product.schema";
import { Model } from "mongoose";
import { rpcBadRequest } from "@app/rpc";
import { ProductEventsPublisher } from "./product-events.publisher";

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
        private readonly events: ProductEventsPublisher,
    ) { }

    async createProduct(input: {
        name: string;
        description: string;
        price: number;
        status: Product['status'];
        imageUrl?: string;
        createdByClerkUserId: string;
    }
    ) {
        if (!input.name || !input.description || input.price === undefined || !input.status || !input.createdByClerkUserId) {
            rpcBadRequest("Missing required fields: name, description, price, status, createdByClerkUserId");
        }

        const createdProduct = await this.productModel.create(input);

        // emit that event after db success 
        await this.events.productCreated({
            productId: String(createdProduct._id),
            name: createdProduct.name,
            description: createdProduct.description,
            price: createdProduct.price,
            imageUrl: createdProduct?.imageUrl,
            status: createdProduct.status,
            createdByClerkUserId: createdProduct.createdByClerkUserId,

        });
        return createdProduct;
    }

    async listProducts() {
        return this.productModel.find().sort({ createdAt: -1 }).exec();
    }

    async getProductById(id: string) {
        const product = await this.productModel.findById(id).exec();
        if (!product) {
            rpcBadRequest("Product not found");
        }
        return product;
    }
}