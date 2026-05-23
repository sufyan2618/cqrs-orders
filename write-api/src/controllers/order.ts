import { orders, orderItems } from "../db/schema";
import { db } from "../lib/db";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { createChannel, QUEUE_NAME } from "../../../shared/src/rabbit";
import type{OrderCreatedEvent, OrderStatusUpdatedEvent} from "../../../shared/src/events";
import { eq } from "drizzle-orm";

const app = new Hono();
const rabbitChannel= await createChannel(process.env.RABBITMQ_URL!);

app.post("/orders", async (c) => {
    const { user_id, items } = await c.req.json();
    const orderId = uuidv4();

    try {
        await db.transaction(async (tx) => {
            await tx.insert(orders).values({
                id: orderId,
                user_id: user_id,
                status: "created",
            });

            await tx.insert(orderItems).values(items.map((item: any) => ({
                order_id: orderId,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price
            })));
        });

        const event: OrderCreatedEvent = {
            type: "OrderCreated",
            data: {
                orderId,
                eventId: uuidv4(),
                userId: user_id,
                items
            }
        };
        rabbitChannel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(event)), { persistent: true });

        return c.json({ id: orderId }, 201);
    } catch (error) {
        console.error("Error creating order:", error);
        return c.json({ error: "Failed to create order" }, 500);
    }
});

app.patch("/orders/:id/status", async (c) => {
    const orderId = c.req.param("id");
    const { newStatus } = await c.req.json();

    try {
        await db.update(orders).set({ status: newStatus }).where(eq(orders.id, orderId));
        const event: OrderStatusUpdatedEvent = {
            type: "OrderStatusUpdated",
            data: {
                orderId,
                eventId: uuidv4(),
                newStatus
            }
        };
        rabbitChannel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(event)), { persistent: true });

        return c.json({ id: orderId, status: newStatus });
    } catch (error) {
        console.error("Error updating order status:", error);
        return c.json({ error: "Failed to update order status" }, 500);
    }
});