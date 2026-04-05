import { Router, type IRouter, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { User, Otp } from "../lib/models";
import { SendOtpBody, VerifyOtpBody } from "@workspace/api-zod";

const router: IRouter = Router();

const JWT_SECRET = process.env["JWT_SECRET"] || "customfit-dev-secret-change-in-prod";

// Generate a 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Serialize user to API shape
function serializeUser(user: InstanceType<typeof User>) {
  return {
    id:        user._id.toString(),
    phone:     user.phone,
    name:      user.name ?? null,
    isAdmin:   user.isAdmin,
    createdAt: user.createdAt,
  };
}

// POST /api/auth/send-otp
router.post("/send-otp", async (req: Request, res: Response) => {
  const parsed = SendOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid phone number" });
    return;
  }

  const { phone } = parsed.data;

  try {
    // Remove any existing OTPs for this phone
    await Otp.deleteMany({ phone });

    // Create new OTP, expires in 10 minutes
    const code      = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.create({ phone, code, expiresAt });

    const isDev = process.env["NODE_ENV"] !== "production";
    const response: { message: string; devOtp?: string } = { message: "OTP sent successfully" };
    if (isDev) response.devOtp = code;

    res.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    console.error("send-otp:", message);
    res.status(503).json({
      error:
        message.includes("MONGODB_URI") || message.includes("Mongo")
          ? "Database is not configured. Set MONGODB_URI and ensure MongoDB is reachable."
          : "Could not send OTP. Try again later.",
    });
  }
});

// POST /api/auth/login-phone — find or create user by phone, no OTP
router.post("/login-phone", async (req: Request, res: Response) => {
  const parsed = SendOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid phone number" });
    return;
  }

  const { phone } = parsed.data;

  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, isAdmin: false });
    }

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "30d" });

    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    console.error("login-phone:", message);
    res.status(503).json({
      error:
        message.includes("MONGODB_URI") || message.includes("Mongo")
          ? "Database is not configured. Set MONGODB_URI and ensure MongoDB is reachable."
          : "Could not sign in. Try again later.",
    });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req: Request, res: Response) => {
  const parsed = VerifyOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { phone, otp } = parsed.data;

  // Find a valid, unexpired OTP
  const otpRecord = await Otp.findOne({ phone, code: otp, expiresAt: { $gt: new Date() } });
  if (!otpRecord) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  await otpRecord.deleteOne();

  // Find or create user
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, isAdmin: false });
  }

  const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "30d" });

  res.json({ token, user: serializeUser(user) });
});

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const token   = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.json(serializeUser(user));
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
