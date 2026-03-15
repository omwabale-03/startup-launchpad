import { Router, type IRouter, type Request, type Response } from "express";
import { Measurement } from "../lib/models";
import { requireAuth } from "../middlewares/auth";
import { SaveMeasurementsBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Serialize measurement to API shape
function serializeMeasurement(m: InstanceType<typeof Measurement>) {
  return {
    id:            m._id.toString(),
    userId:        m.userId.toString(),
    waist:         m.waist,
    hip:           m.hip,
    pantLength:    m.pantLength,
    thigh:         m.thigh,
    fitPreference: m.fitPreference,
    updatedAt:     m.updatedAt,
  };
}

// POST /api/measurements — upsert user measurements
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const parsed = SaveMeasurementsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid measurement data" });
    return;
  }

  const userId = req.user!._id;
  const { waist, hip, pantLength, thigh, fitPreference } = parsed.data;

  const measurement = await Measurement.findOneAndUpdate(
    { userId },
    { waist, hip, pantLength, thigh, fitPreference, updatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json(serializeMeasurement(measurement!));
});

// GET /api/measurements — get current user's measurements
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const measurement = await Measurement.findOne({ userId: req.user!._id });

  if (!measurement) {
    res.status(404).json({ error: "No measurements found" });
    return;
  }

  res.json(serializeMeasurement(measurement));
});

export default router;
