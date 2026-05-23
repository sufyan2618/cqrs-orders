CREATE TABLE "orders_view" (
	"order_id" uuid PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp,
	"items" jsonb NOT NULL,
	"order_total" integer,
	"item_count" integer
);
--> statement-breakpoint
CREATE TABLE "processed_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"processed_at" timestamp DEFAULT now()
);
