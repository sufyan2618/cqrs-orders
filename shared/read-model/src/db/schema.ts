import { pgTable, uuid, text, jsonb, integer, timestamp } from "drizzle-orm/pg-core";

// Flat, precomputed — zero joins needed at query time
export const ordersView = pgTable("orders_view", {
  orderId:    uuid("order_id").primaryKey(),
  userId:     integer("user_id").notNull(),
  status:     text("status").notNull(),
  createdAt:  timestamp("created_at"),
  items:      jsonb("items").notNull(),
  orderTotal: integer("order_total"),
  itemCount:  integer("item_count"),
});

// Idempotency table — prevents duplicate event processing
export const processedEvents = pgTable("processed_events", {
  eventId:     text("event_id").primaryKey(),
  processedAt: timestamp("processed_at").defaultNow(),
});
