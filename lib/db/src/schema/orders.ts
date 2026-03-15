import { pgTable, serial, integer, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { measurementsTable } from "./measurements";

// Orders table - stores customer orders
export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  measurementId: integer("measurement_id").notNull().references(() => measurementsTable.id),
  fabricType: text("fabric_type").notNull(), // cotton | stretch-cotton | linen
  color: text("color").notNull(),
  pocketStyle: text("pocket_style").notNull(), // classic | cargo | no-pocket
  occasion: text("occasion").notNull(), // formal | casual
  estimatedPrice: real("estimated_price").notNull(),
  status: text("status").notNull().default("pending"), // pending | processing | shipped | delivered
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
