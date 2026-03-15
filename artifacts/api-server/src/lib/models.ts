import mongoose, { Schema, type Document } from "mongoose";

// ─── User ────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  phone: string;
  name?: string;
  isAdmin: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone:   { type: String, required: true, unique: true },
    name:    { type: String },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export const User = mongoose.models["User"] as mongoose.Model<IUser> || mongoose.model<IUser>("User", UserSchema);

// ─── OTP ─────────────────────────────────────────────────────────────────────

export interface IOtp extends Document {
  phone:     string;
  code:      string;
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    phone:     { type: String, required: true },
    code:      { type: String, required: true },
    expiresAt: { type: Date,   required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

// Auto-delete expired OTPs via MongoDB TTL index
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.models["Otp"] as mongoose.Model<IOtp> || mongoose.model<IOtp>("Otp", OtpSchema);

// ─── Measurement ─────────────────────────────────────────────────────────────

export interface IMeasurement extends Document {
  userId:        mongoose.Types.ObjectId;
  waist:         number;
  hip:           number;
  pantLength:    number;
  thigh:         number;
  fitPreference: string; // slim | regular | relaxed
  updatedAt:     Date;
}

const MeasurementSchema = new Schema<IMeasurement>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: "User", required: true },
    waist:         { type: Number, required: true },
    hip:           { type: Number, required: true },
    pantLength:    { type: Number, required: true },
    thigh:         { type: Number, required: true },
    fitPreference: { type: String, required: true, enum: ["slim", "regular", "relaxed"] },
  },
  { timestamps: { createdAt: false, updatedAt: "updatedAt" } }
);

export const Measurement = mongoose.models["Measurement"] as mongoose.Model<IMeasurement> || mongoose.model<IMeasurement>("Measurement", MeasurementSchema);

// ─── Order ────────────────────────────────────────────────────────────────────

export interface IOrder extends Document {
  userId:         mongoose.Types.ObjectId;
  measurementId:  mongoose.Types.ObjectId;
  fabricType:     string; // cotton | stretch-cotton | linen
  color:          string;
  pocketStyle:    string; // classic | cargo | no-pocket
  occasion:       string; // formal | casual
  estimatedPrice: number;
  status:         string; // pending | processing | shipped | delivered
  createdAt:      Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: "User",        required: true },
    measurementId:  { type: Schema.Types.ObjectId, ref: "Measurement", required: true },
    fabricType:     { type: String, required: true },
    color:          { type: String, required: true },
    pocketStyle:    { type: String, required: true },
    occasion:       { type: String, required: true },
    estimatedPrice: { type: Number, required: true },
    status:         { type: String, default: "pending" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export const Order = mongoose.models["Order"] as mongoose.Model<IOrder> || mongoose.model<IOrder>("Order", OrderSchema);
