import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product, ProductDocument } from "./product.schema";
import { Mode } from "fs";
import { Model } from "mongoose";
import { rpcBadRequest } from "@app/rpc";

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private readonly productModel : Model<ProductDocument>
    ) {}

    async createProduct(input: {
        name: string;
        description: string;
        price: number;
        status: Product['status'];
        imageUrl?: string;
        createdByClerkUserId: string;
    }
    ){
        if(!input.name || !input.description || input.price === undefined || !input.status || !input.createdByClerkUserId) {
            rpcBadRequest("Missing required fields: name, description, price, status, createdByClerkUserId");
        }

        const createdProduct = await this.productModel.create(input);
        return createdProduct;
    }

    async listProducts() {
        return this.productModel.find().sort({ createdAt: -1 }).exec();
    }

    async getProductById(id: string) {
        const product = await this.productModel.findById(id).exec();
        if(!product) {
            rpcBadRequest("Product not found");
        }
        return product;
    }
}