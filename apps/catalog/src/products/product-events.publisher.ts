import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ProductCreatedEvent, ProductEvent } from "./product.events";

@Injectable()
export class ProductEventsPublisher implements OnModuleInit {
    private readonly logger = new Logger(ProductEventsPublisher.name);

    constructor(
        @Inject('SEARCH_EVENTS_CLIENT') private readonly client: ClientProxy,
    ) {}

    async onModuleInit() {
        try {
            await this.client.connect();
            this.logger.log('Connected to search events RMQ client');
        } catch (error) {
            this.logger.error('Failed to connect to search events RMQ client', error);
        }
    }

    async productCreated(event: ProductCreatedEvent) {
        this.logger.log(`Publishing product created event: ${event.productId}`);
        this.client.emit(ProductEvent.PRODUCT_CREATED, event);
    }
}