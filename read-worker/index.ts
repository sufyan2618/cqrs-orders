import { createChannel, QUEUE_NAME } from "../shared/src/rabbit";
import { db } from "../shared/read-model/src/lib/db";
import { processedEvents } from "../shared/read-model/src/db/schema";
import { projectOrderCreated, projectOrderStatusUpdated } from "./src/projectors/order";
import { eq } from "../shared/read-model/src/lib/drizzle";
import type { OrderEvent } from "../shared/src/events";


const channel = await createChannel(process.env.RABBITMQ_URL!);
channel.prefetch(1); // one message at a time

console.log("Read worker listening...");

channel.consume(QUEUE_NAME, async (msg) => {
  if (!msg) return;

  const event: OrderEvent = JSON.parse(msg.content.toString());

  const already = await db.select()
    .from(processedEvents)
    .where(eq(processedEvents.eventId, event.data.eventId))
    .limit(1);

  if (already.length > 0) {
    console.log(`Duplicate, skipping: ${event.data.eventId}`);
    channel.ack(msg);
    return;
  }

  try {
    await db.transaction(async (tx) => {
      if (event.type === "OrderCreated") {
        await projectOrderCreated(event);
      } else if (event.type === "OrderStatusUpdated") {
        await projectOrderStatusUpdated(event);
      }
      await tx.insert(processedEvents).values({ eventId: event.data.eventId });
    });

    channel.ack(msg);
    console.log(`Processed: ${event.type} ${event.data.eventId}`);
  } catch (err) {
    console.error("Worker error, requeueing:", err);
    channel.nack(msg, false, true); // requeue on error
  }
}, { noAck: false });