import { pgTable, serial, integer, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

// Measurements table - stores user body measurements
export const measurementsTable = pgTable("measurements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  waist: real("waist").notNull(),
  hip: real("hip").notNull(),
  pantLength: real("pant_length").notNull(),
  thigh: real("thigh").notNull(),
  fitPreference: text("fit_preference").notNull(), // slim | regular | relaxed
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMeasurementSchema = createInsertSchema(measurementsTable).omit({ id: true, updatedAt: true });
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;
export type Measurement = typeof measurementsTable.$inferSelect;
