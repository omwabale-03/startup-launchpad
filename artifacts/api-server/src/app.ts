import express, { type Express } from "express";
import cors from "cors";
import { connectDB } from "./lib/mongodb";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB before handling any requests
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err.message);
  // Don't exit — allow retries on next request
});

app.use("/api", router);

export default app;
