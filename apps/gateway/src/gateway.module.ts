import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI_USERS as string),
    ClientsModule.register([
      {
        name: 'CATALOG_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL || 'amqp://admin:admin@localhost:5672'],
          queue: process.env.CATALOG_QUEUE || 'catalog_queue',
          durable: false,
        }
      },
      {
        name: 'SEARCH_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL || 'amqp://admin:admin@localhost:5672'],
          queue: process.env.SEARCH_QUEUE || 'search_queue',
          durable: false,
        },
      },
      {
        name: 'MEDIA_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL || 'amqp://admin:admin@localhost:5672'],
          queue: process.env.MEDIA_QUEUE || 'media_queue',
          durable: false,
        },
      }
    ])
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
