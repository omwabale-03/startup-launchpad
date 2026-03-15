import mongoose from "mongoose";

const MONGODB_URI = process.env["MONGODB_URI"];

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return; // already connected

  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB");
}

export default mongoose;
