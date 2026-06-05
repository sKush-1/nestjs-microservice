import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateProductDto } from "./product.dto";
import { ProductService } from "./product.service";

@Controller()
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) {}

    @MessagePattern("product.create")
    create(@Payload() payload: CreateProductDto ) {
        return this.productService.createProduct(payload);
    }

    @MessagePattern("product.list")
    list(){
        return this.productService.listProducts();
    }

    @MessagePattern("product.getById")
    getbyId(@Payload() payload: {id: string}){
        return this.productService.getProductById(payload.id);
    }

}
