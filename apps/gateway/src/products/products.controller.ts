import { Body, Controller, Get, Inject, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CurrentUser } from "../auth/current-user.decorator";
import type { UserContext } from "../auth/auth.types";
import { mapRpcErrorToHttpStatus } from "@app/rpc";
import { firstValueFrom, timeout } from "rxjs";
import { AdminOnly } from "../auth/admin.decorator";
import { Public } from "../auth/public.decorator";
import { FileInterceptor } from "@nestjs/platform-express";

type UploadedFile = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    destination?: string;
    filename?: string;
    path?: string;
    stream?: any;
};


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
        @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy,
        @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientProxy

    ) {}

    @Post('products')
    @AdminOnly()
    @UseInterceptors(
        FileInterceptor('image', {
            limits: {
                fieldSize: 5 * 1024 * 1024
            }
        })
    )
    async createProduct(
        @CurrentUser() user: UserContext,
        @UploadedFile() file: UploadedFile | undefined,
        @Body() 
        body: {
            name: string;
            description: string;
            price: number
            status?: 'available' | 'unavailable';
            imageUrl?: string;
        }
    ){
            let imageUrl: string | undefined = undefined;
            let mediaId: string | undefined = undefined;
            let product:Product

             if(file){
                const base64 = file.buffer.toString('base64')
                try {
                    const uploadResult = await firstValueFrom(
                        this.mediaClient.send('media.uploadProductImage',{
                            fileName: file.originalname,
                            mimeType : file.mimetype,
                            base64,
                            uploadByUserId: user.clerkUserId
                        }).pipe(timeout(10000))
                    )

                    mediaId = uploadResult?.mediaId;
                    imageUrl = uploadResult?.url;
                } catch (error) {
                    mapRpcErrorToHttpStatus(error)
                }
            }



            const payload = {
                name: body.name,
                description: body.description,
                price: Number(body.price),
                status: body.status || 'available',
                imageUrl: imageUrl,
                createdByClerkUserId: user.clerkUserId
            }

            try {
                product = await firstValueFrom(
                    this.catalogClient.send('product.create', payload).pipe(timeout(10000))
                );

                if (!product) {
                    console.error('Catalog service returned empty response for product.create');
                    throw new Error('Catalog service returned no product');
                }
            } catch (error) {
                console.error('Product create failed:', error);
                mapRpcErrorToHttpStatus(error);
            }

            

            if(mediaId){
                try {
                    await firstValueFrom(
                        this.mediaClient.send('media.attachToProduct',{
                            mediaId,
                            productId: String(product?._id),
                            attachedByUserId: user.clerkUserId
                        }).pipe(timeout(10000))
                    );
                } catch (error) {
                    mapRpcErrorToHttpStatus(error)
                }
            }

            return product;

         
    }

    @Get('products')
    @Public()
    async listProducts(){
        try {
            return await firstValueFrom(this.catalogClient.send('product.list',{}))
        } catch (error) {
            mapRpcErrorToHttpStatus(error)
        }
    }

    @Get('products/:id')
    @Public()
    async getProductById(@Param('id') id:string){
        try {
            return firstValueFrom(this.catalogClient.send('product.getById',{id}))
        } catch (error) {
            mapRpcErrorToHttpStatus(error)
        }
    }


}