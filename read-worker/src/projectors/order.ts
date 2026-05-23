import type{ OrderCreatedEvent, OrderStatusUpdatedEvent } from "../../../shared/src/events";
import { ordersView } from "../../../shared/read-model/src/db/schema";
import { db } from "../../../shared/read-model/src/lib/db";
import { eq } from "../../../shared/read-model/src/lib/drizzle";


export async function projectOrderCreated(event: OrderCreatedEvent) {
    const items = event.data.items.map(item => ({
        ...item,
        lineTotal: item.quantity * item.price,
    }));
    const orderTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    await db.insert(ordersView).values({
        orderId: event.data.orderId,
        userId: event.data.userId,
        status: "created",
        createdAt: new Date(),
        items,
        orderTotal,
        itemCount
    });
}


export async function projectOrderStatusUpdated(event: OrderStatusUpdatedEvent) {
    await db.update(ordersView)
        .set({ status: event.data.newStatus })
        .where(eq(ordersView.orderId, event.data.orderId));
}

