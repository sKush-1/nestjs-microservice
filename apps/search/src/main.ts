import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SearchModule } from './search.module';
import { applyToMicroserviceLayer } from '@app/rpc';

async function bootstrap() {
  process.title = "search";
  const logger = new Logger("SearchBootstrap");
  const rmqUrl = process.env.RMQ_URL || 'amqp://admin:admin@localhost:5672';
  const searchQueue = process.env.SEARCH_QUEUE || 'search_queue';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(SearchModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: searchQueue,
      durable: false,
    },
  })
  applyToMicroserviceLayer(app);
  await app.enableShutdownHooks();
  await app.listen();

  logger.log(`Search queue is listening on queue ${searchQueue}`);
}
bootstrap();
