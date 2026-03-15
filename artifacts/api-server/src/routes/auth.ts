import { Router, type IRouter, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable, otpTable } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";
import {
  SendOtpBody,
  VerifyOtpBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const JWT_SECRET = process.env["JWT_SECRET"] || "customfit-dev-secret-change-in-prod";

// Generate a 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/send-otp
// Generates and stores an OTP for the given phone number (simulated - no real SMS)
router.post("/send-otp", async (req: Request, res: Response) => {
  const parsed = SendOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid phone number" });
    return;
  }

  const { phone } = parsed.data;

  // Delete any existing OTPs for this phone
  await db.delete(otpTable).where(eq(otpTable.phone, phone));

  // Create new OTP (expires in 10 minutes)
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(otpTable).values({ phone, code, expiresAt });

  // In production, send via SMS. Here we return it in dev mode.
  const isDev = process.env["NODE_ENV"] !== "production";
  const response: { message: string; devOtp?: string } = {
    message: "OTP sent successfully",
  };
  if (isDev) {
    response.devOtp = code;
  }

  res.json(response);
});

// POST /api/auth/verify-otp
// Verifies OTP and returns a JWT token, creating user if first time
router.post("/verify-otp", async (req: Request, res: Response) => {
  const parsed = VerifyOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { phone, otp } = parsed.data;

  // Find valid OTP
  const now = new Date();
  const [otpRecord] = await db
    .select()
    .from(otpTable)
    .where(and(eq(otpTable.phone, phone), eq(otpTable.code, otp), gt(otpTable.expiresAt, now)))
    .limit(1);

  if (!otpRecord) {
    res.status(400).json({ error: "Invalid or expired OTP" });
    return;
  }

  // Delete used OTP
  await db.delete(otpTable).where(eq(otpTable.id, otpRecord.id));

  // Find or create user
  let [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);

  if (!user) {
    const [newUser] = await db
      .insert(usersTable)
      .values({ phone, isAdmin: false })
      .returning();
    user = newUser;
  }

  // Sign JWT
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });

  res.json({
    token,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    },
  });
});

// GET /api/auth/me
// Returns current user based on JWT token
router.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      phone: user.phone,
      name: user.name,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// POST /api/auth/logout
// Client just discards the token; this endpoint is for symmetry
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
