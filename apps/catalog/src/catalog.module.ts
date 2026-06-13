import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './products/product.schema';
import { ProductController } from './products/product.controller';
import { ProductService } from './products/product.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductEventsPublisher } from './products/product-events.publisher';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.MONGO_URI_CATALOG as string),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    // talks directly via rmq cleint not via gateway
    ClientsModule.register([
      {
        name: 'SEARCH_EVENTS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL as string],
          queue: process.env.SEARCH_QUEUE as string,
          durable: false,
        }
      }
    ])
  ],
  controllers: [CatalogController, ProductController],
  providers: [CatalogService, ProductService, ProductEventsPublisher],
})
export class CatalogModule { }
