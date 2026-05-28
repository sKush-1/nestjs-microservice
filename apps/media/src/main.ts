import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MediaModule } from './media.module';

async function bootstrap() {
  process.title = "media";
  const logger = new Logger("MediaBootstrap");
  const rmqUrl = process.env.RMQ_URL || 'amqp://admin:admin@localhost:5672';
  const mediaQueue = process.env.MEDIA_QUEUE || 'media_queue';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(MediaModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: mediaQueue,
      durable: false,
    },
  })
  await app.enableShutdownHooks();
  await app.listen();

  logger.log(`Media queue is listening on queue ${mediaQueue}`);
}
bootstrap();


