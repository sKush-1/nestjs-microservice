
export type ProductCreatedEvent = {
    productId: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string,
    status: 'available' | 'unavailable' | 'discontinued';
    createdByClerkUserId: string;
}

export enum ProductEvent {
    PRODUCT_CREATED = 'product.created',
    PRODUCT_UPDATED = 'product.updated',
    PRODUCT_DELETED = 'product.deleted',
    PRODUCT_RESTORED = 'product.restored',
    PRODUCT_SOLD = 'product.sold',
    LOW_STOCK = 'product.low_stock',
    PRODUCT_RETURNED = 'product.returned',
}