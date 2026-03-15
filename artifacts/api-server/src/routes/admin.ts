import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { usersTable, ordersTable, measurementsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/admin/users - Get all users
router.get("/users", requireAdmin, async (_req: Request, res: Response) => {
  const users = await db
    .select({
      id: usersTable.id,
      phone: usersTable.phone,
      name: usersTable.name,
      isAdmin: usersTable.isAdmin,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(usersTable.createdAt);

  res.json(users);
});

// GET /api/admin/orders - Get all orders with user info
router.get("/orders", requireAdmin, async (_req: Request, res: Response) => {
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
      user: {
        id: usersTable.id,
        phone: usersTable.phone,
        name: usersTable.name,
        isAdmin: usersTable.isAdmin,
        createdAt: usersTable.createdAt,
      },
    })
    .from(ordersTable)
    .leftJoin(measurementsTable, eq(ordersTable.measurementId, measurementsTable.id))
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .orderBy(ordersTable.createdAt);

  res.json(orders);
});

// GET /api/admin/measurements - Get all measurements with user info
router.get("/measurements", requireAdmin, async (_req: Request, res: Response) => {
  const measurements = await db
    .select({
      id: measurementsTable.id,
      userId: measurementsTable.userId,
      waist: measurementsTable.waist,
      hip: measurementsTable.hip,
      pantLength: measurementsTable.pantLength,
      thigh: measurementsTable.thigh,
      fitPreference: measurementsTable.fitPreference,
      updatedAt: measurementsTable.updatedAt,
      user: {
        id: usersTable.id,
        phone: usersTable.phone,
        name: usersTable.name,
        isAdmin: usersTable.isAdmin,
        createdAt: usersTable.createdAt,
      },
    })
    .from(measurementsTable)
    .leftJoin(usersTable, eq(measurementsTable.userId, usersTable.id))
    .orderBy(measurementsTable.updatedAt);

  res.json(measurements);
});

export default router;
