export interface OrderCreatedEvent {
  type: "OrderCreated";
  data: {
    orderId: string;
    userId: number;
    items: {
      productName: string;
      quantity: number;
      price: number;
    }[];
  };
}

export interface OrderStatusUpdatedEvent {
  type: "OrderStatusUpdated";
  data: {
    orderId: string;
    newStatus: string;
  };
}

export type OrderEvent = OrderCreatedEvent | OrderStatusUpdatedEvent;