import { Hono } from "hono";
import { db } from "../../../shared/read-model/src/lib/db";
import { ordersView } from "../../../shared/read-model/src/db/schema";
import { eq, desc } from "../../../shared/read-model/src/lib/drizzle";

const app = new Hono();

// Get single order — no joins, instant
app.get("/orders/:id", async (c) => {
  const { id } = c.req.param();
  const order = await db.select()
    .from(ordersView)
    .where(eq(ordersView.orderId, id))
    .limit(1);

  if (!order.length) return c.json({ error: "Not found" }, 404);
  return c.json(order[0]);
});

// Dashboard — precomputed data, no aggregation at query time
app.get("/dashboard", async (c) => {
  const userIdParam = c.req.query("userId");
  const userId = userIdParam ? Number(userIdParam) : NaN;

  if (!Number.isInteger(userId)) {
    return c.json({ error: "Invalid userId" }, 400);
  }

  const userOrders = await db.select()
    .from(ordersView)
    .where(eq(ordersView.userId, userId))
    .orderBy(desc(ordersView.createdAt))
    .limit(10);

  const totalSpent = userOrders.reduce(
    (sum, o) => sum + Number(o.orderTotal), 0
  );

  return c.json({
    totalOrders: userOrders.length,
    totalSpent: totalSpent.toFixed(2),
    recentOrders: userOrders,
  });
});

export default app;