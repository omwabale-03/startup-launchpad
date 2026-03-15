import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import measurementsRouter from "./measurements";
import ordersRouter from "./orders";
import adminRouter from "./admin";

const router: IRouter = Router();

// Health check
router.use(healthRouter);

// Auth routes: /api/auth/*
router.use("/auth", authRouter);

// Measurements routes: /api/measurements
router.use("/measurements", measurementsRouter);

// Orders routes: /api/orders
router.use("/orders", ordersRouter);

// Admin routes: /api/admin/*
router.use("/admin", adminRouter);

export default router;
