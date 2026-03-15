import { Router, type IRouter, type Request, type Response } from "express";
import mongoose from "mongoose";
import { Order, Measurement } from "../lib/models";
import { requireAuth } from "../middlewares/auth";
import { CreateOrderBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Calculate estimated price based on customization choices
function calculatePrice(fabricType: string, pocketStyle: string, occasion: string, fitPreference: string): number {
  let base = 89;
  if (fabricType === "stretch-cotton") base = 99;
  if (fabricType === "linen")          base = 109;

  let extras = 0;
  if (pocketStyle === "cargo")     extras += 15;
  if (pocketStyle === "no-pocket") extras -= 5;
  if (occasion    === "formal")    extras += 10;
  if (fitPreference === "slim")    extras += 5;

  return Math.round((base + extras) * 100) / 100;
}

// Serialize order + embedded measurement to API shape
function serializeOrder(order: InstanceType<typeof Order>, measurement: InstanceType<typeof Measurement> | null) {
  const base = {
    id:             order._id.toString(),
    userId:         order.userId.toString(),
    measurementId:  order.measurementId.toString(),
    fabricType:     order.fabricType,
    color:          order.color,
    pocketStyle:    order.pocketStyle,
    occasion:       order.occasion,
    estimatedPrice: order.estimatedPrice,
    status:         order.status,
    createdAt:      order.createdAt,
  };

  if (!measurement) return base;

  return {
    ...base,
    measurement: {
      id:            measurement._id.toString(),
      userId:        measurement.userId.toString(),
      waist:         measurement.waist,
      hip:           measurement.hip,
      pantLength:    measurement.pantLength,
      thigh:         measurement.thigh,
      fitPreference: measurement.fitPreference,
      updatedAt:     measurement.updatedAt,
    },
  };
}

// POST /api/orders — create a new order
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order data" });
    return;
  }

  const userId = req.user!._id;
  const { fabricType, color, pocketStyle, occasion, measurementId } = parsed.data;

  // Verify measurement belongs to this user
  if (!mongoose.Types.ObjectId.isValid(String(measurementId))) {
    res.status(400).json({ error: "Invalid measurement ID" });
    return;
  }

  const measurement = await Measurement.findOne({
    _id:    new mongoose.Types.ObjectId(String(measurementId)),
    userId,
  });

  if (!measurement) {
    res.status(400).json({ error: "Measurement not found" });
    return;
  }

  const estimatedPrice = calculatePrice(fabricType, pocketStyle, occasion, measurement.fitPreference);

  const order = await Order.create({
    userId,
    measurementId: measurement._id,
    fabricType,
    color,
    pocketStyle,
    occasion,
    estimatedPrice,
    status: "pending",
  });

  res.status(201).json(serializeOrder(order, measurement));
});

// GET /api/orders — list orders for the current user
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.user!._id }).sort({ createdAt: 1 });

  const measurementIds = [...new Set(orders.map(o => o.measurementId.toString()))];
  const measurements   = await Measurement.find({ _id: { $in: measurementIds } });
  const measById       = Object.fromEntries(measurements.map(m => [m._id.toString(), m]));

  res.json(orders.map(o => serializeOrder(o, measById[o.measurementId.toString()] ?? null)));
});

// GET /api/orders/:id — single order
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = req.params["id"];

  if (!mongoose.Types.ObjectId.isValid(id!)) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const order = await Order.findOne({ _id: id, userId: req.user!._id });
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const measurement = await Measurement.findById(order.measurementId);
  res.json(serializeOrder(order, measurement));
});

export default router;
