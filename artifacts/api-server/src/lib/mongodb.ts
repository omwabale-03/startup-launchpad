import mongoose from "mongoose";
import type { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return; // already connected

  let uri = process.env["MONGODB_URI"];

  if (!uri) {
    if (process.env["NODE_ENV"] === "production") {
      throw new Error("MONGODB_URI environment variable is required");
    }
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log(
      "No MONGODB_URI set — using in-memory MongoDB for local development (data resets when the server stops).",
    );
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

export default mongoose;
