import { Hono } from "hono";
import { serve } from "bun";
import { config } from "dotenv";
import { db } from "../shared/read-model/src/lib/db";

import orderRoutes from "./src/routes/order";

config();

const app = new Hono();

app.get("/", (c) => {
  return c.text("Bun + Hono CRUD API");
});

app.route("/api/orders", orderRoutes);

serve({
  fetch: app.fetch,
  port: 4000,
});

console.log("Server running on http://localhost:4000");