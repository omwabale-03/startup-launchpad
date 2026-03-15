import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { ordersTable, measurementsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateOrderBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Calculate estimated price based on choices
function calculatePrice(
  fabricType: string,
  pocketStyle: string,
  occasion: string,
  fitPreference: string
): number {
  let base = 89; // default cotton
  if (fabricType === "stretch-cotton") base = 99;
  if (fabricType === "linen") base = 109;

  let extras = 0;
  if (pocketStyle === "cargo") extras += 15;
  if (pocketStyle === "no-pocket") extras -= 5;
  if (occasion === "formal") extras += 10;
  if (fitPreference === "slim") extras += 5;

  return Math.round((base + extras) * 100) / 100;
}

// POST /api/orders - Create a new order
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order data" });
    return;
  }

  const userId = req.user!.id;
  const { fabricType, color, pocketStyle, occasion, measurementId } = parsed.data;

  // Verify measurement belongs to user
  const [measurement] = await db
    .select()
    .from(measurementsTable)
    .where(and(eq(measurementsTable.id, measurementId), eq(measurementsTable.userId, userId)))
    .limit(1);

  if (!measurement) {
    res.status(400).json({ error: "Invalid measurement ID" });
    return;
  }

  const estimatedPrice = calculatePrice(fabricType, pocketStyle, occasion, measurement.fitPreference);

  const [order] = await db
    .insert(ordersTable)
    .values({
      userId,
      measurementId,
      fabricType,
      color,
      pocketStyle,
      occasion,
      estimatedPrice,
      status: "pending",
    })
    .returning();

  res.status(201).json({ ...order, measurement });
});

// GET /api/orders - Get all orders for current user
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const orders = await db
    .select({
      id: ordersTable.id,
      userId: ordersTable.userId,
      measurementId: ordersTable.measurementId,
      fabricType: ordersTable.fabricType,
      color: ordersTable.color,
      pocketStyle: ordersTable.pocketStyle,
      occasion: ordersTable.occasion,
      estimatedPrice: ordersTable.estimatedPrice,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      measurement: {
        id: measurementsTable.id,
        userId: measurementsTable.userId,
        waist: measurementsTable.waist,
        hip: measurementsTable.hip,
        pantLength: measurementsTable.pantLength,
        thigh: measurementsTable.thigh,
        fitPreference: measurementsTable.fitPreference,
        updatedAt: measurementsTable.updatedAt,
      },
    })
    .from(ordersTable)
    .leftJoin(measurementsTable, eq(ordersTable.measurementId, measurementsTable.id))
    .where(eq(ordersTable.userId, userId))
    .orderBy(ordersTable.createdAt);

  res.json(orders);
});

// GET /api/orders/:id - Get a single order
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const orderId = parseInt(req.params["id"] ?? "0");

  if (isNaN(orderId)) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const [order] = await db
    .select({
      id: ordersTable.id,
      userId: ordersTable.userId,
      measurementId: ordersTable.measurementId,
      fabricType: ordersTable.fabricType,
      color: ordersTable.color,
      pocketStyle: ordersTable.pocketStyle,
      occasion: ordersTable.occasion,
      estimatedPrice: ordersTable.estimatedPrice,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      measurement: {
        id: measurementsTable.id,
        userId: measurementsTable.userId,
        waist: measurementsTable.waist,
        hip: measurementsTable.hip,
        pantLength: measurementsTable.pantLength,
        thigh: measurementsTable.thigh,
        fitPreference: measurementsTable.fitPreference,
        updatedAt: measurementsTable.updatedAt,
      },
    })
    .from(ordersTable)
    .leftJoin(measurementsTable, eq(ordersTable.measurementId, measurementsTable.id))
    .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)))
    .limit(1);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(order);
});

export default router;
