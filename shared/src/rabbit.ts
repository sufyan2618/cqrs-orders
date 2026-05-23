import amqplib from "amqplib";
import Bun from "bun";

export const QUEUE_NAME = "order-events";

export async function createChannel(url: string) {
  // Retry loop — RabbitMQ takes a few seconds to start in Docker
  for (let i = 0; i < 10; i++) {
    try {
      const conn = await amqplib.connect(url);
      const channel = await conn.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log("RabbitMQ connected");
      return channel;
    } catch {
      console.log(`RabbitMQ not ready, retrying in 3s... (${i + 1}/10)`);
      await Bun.sleep(3000);
    }
  }
  throw new Error("Could not connect to RabbitMQ after 10 retries");
}