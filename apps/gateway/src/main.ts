import { NestFactory } from "@nestjs/core";
import { GatewayModule } from "./gateway.module";
import { Logger } from "@nestjs/common";

async function bootstrap(){
  process.title = "Gateway";
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(GatewayModule);
  
  app.enableShutdownHooks();

  const port = Number(process.env.GATEWAY_PORT) || 3000;
  await app.listen(port, "0.0.0.0", () => {
    logger.log(`Gateway is listening on port ${port}`);
  });

}

bootstrap();