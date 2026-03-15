import { Router, type IRouter, type Request, type Response } from "express";
import { User, Order, Measurement } from "../lib/models";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/admin/users
router.get("/users", requireAdmin, async (_req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: 1 });
  res.json(users.map(u => ({
    id:        u._id.toString(),
    phone:     u.phone,
    name:      u.name ?? null,
    isAdmin:   u.isAdmin,
    createdAt: u.createdAt,
  })));
});

// GET /api/admin/orders
router.get("/orders", requireAdmin, async (_req: Request, res: Response) => {
  const orders       = await Order.find().sort({ createdAt: 1 }).populate("userId").populate("measurementId");

  res.json(orders.map(o => {
    const user = o.userId as any;
    const meas = o.measurementId as any;

    return {
      id:             o._id.toString(),
      userId:         user._id?.toString() ?? o.userId.toString(),
      measurementId:  meas._id?.toString() ?? o.measurementId.toString(),
      fabricType:     o.fabricType,
      color:          o.color,
      pocketStyle:    o.pocketStyle,
      occasion:       o.occasion,
      estimatedPrice: o.estimatedPrice,
      status:         o.status,
      createdAt:      o.createdAt,
      user: user._id ? {
        id:        user._id.toString(),
        phone:     user.phone,
        name:      user.name ?? null,
        isAdmin:   user.isAdmin,
        createdAt: user.createdAt,
      } : null,
      measurement: meas._id ? {
        id:            meas._id.toString(),
        userId:        meas.userId.toString(),
        waist:         meas.waist,
        hip:           meas.hip,
        pantLength:    meas.pantLength,
        thigh:         meas.thigh,
        fitPreference: meas.fitPreference,
        updatedAt:     meas.updatedAt,
      } : null,
    };
  }));
});

// GET /api/admin/measurements
router.get("/measurements", requireAdmin, async (_req: Request, res: Response) => {
  const measurements = await Measurement.find().sort({ updatedAt: 1 }).populate("userId");

  res.json(measurements.map(m => {
    const user = m.userId as any;
    return {
      id:            m._id.toString(),
      userId:        user._id?.toString() ?? m.userId.toString(),
      waist:         m.waist,
      hip:           m.hip,
      pantLength:    m.pantLength,
      thigh:         m.thigh,
      fitPreference: m.fitPreference,
      updatedAt:     m.updatedAt,
      user: user._id ? {
        id:        user._id.toString(),
        phone:     user.phone,
        name:      user.name ?? null,
        isAdmin:   user.isAdmin,
        createdAt: user.createdAt,
      } : null,
    };
  }));
});

export default router;
