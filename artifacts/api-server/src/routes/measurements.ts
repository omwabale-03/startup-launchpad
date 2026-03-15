import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { measurementsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { SaveMeasurementsBody } from "@workspace/api-zod";

const router: IRouter = Router();

// POST /api/measurements - Save or update user measurements
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const parsed = SaveMeasurementsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid measurement data" });
    return;
  }

  const userId = req.user!.id;
  const { waist, hip, pantLength, thigh, fitPreference } = parsed.data;

  // Check if measurements already exist for this user
  const [existing] = await db
    .select()
    .from(measurementsTable)
    .where(eq(measurementsTable.userId, userId))
    .limit(1);

  if (existing) {
    // Update existing measurements
    const [updated] = await db
      .update(measurementsTable)
      .set({ waist, hip, pantLength, thigh, fitPreference, updatedAt: new Date() })
      .where(eq(measurementsTable.userId, userId))
      .returning();
    res.json(updated);
  } else {
    // Create new measurements
    const [created] = await db
      .insert(measurementsTable)
      .values({ userId, waist, hip, pantLength, thigh, fitPreference })
      .returning();
    res.json(created);
  }
});

// GET /api/measurements - Get current user's measurements
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [measurement] = await db
    .select()
    .from(measurementsTable)
    .where(eq(measurementsTable.userId, userId))
    .limit(1);

  if (!measurement) {
    res.status(404).json({ error: "No measurements found" });
    return;
  }

  res.json(measurement);
});

export default router;
