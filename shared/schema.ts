import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role", { enum: ["user", "admin", "superadmin"] }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
});

export const testCategories = pgTable("test_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("science"),
});

export const insertTestCategorySchema = createInsertSchema(testCategories).pick({
  name: true,
  description: true,
  icon: true,
});

export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  categoryId: integer("category_id").notNull(),
  preparationInstructions: text("preparation_instructions"),
  reportTemplate: json("report_template"),
});

export const insertTestSchema = createInsertSchema(tests).pick({
  name: true,
  description: true,
  price: true,
  categoryId: true,
  preparationInstructions: true,
  reportTemplate: true,
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull(),
  userId: integer("user_id").notNull(),
  bookingId: text("booking_id").notNull().unique(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  collectionType: text("collection_type").notNull(),
  status: text("status").notNull().default("booked"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  testId: true,
  userId: true,
  scheduledDate: true,
  collectionType: true,
  address: true,
});

export const bookingStatuses = pgTable("booking_statuses", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  notes: text("notes"),
});

export const insertBookingStatusSchema = createInsertSchema(bookingStatuses).pick({
  bookingId: true,
  status: true,
  notes: true,
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  reportId: text("report_id").notNull().unique(),
  results: json("results"),
  insights: json("insights"),
  generatedDate: timestamp("generated_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
});

export const insertReportSchema = createInsertSchema(reports).pick({
  bookingId: true,
  results: true,
  insights: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TestCategory = typeof testCategories.$inferSelect;
export type InsertTestCategory = z.infer<typeof insertTestCategorySchema>;

export type Test = typeof tests.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type BookingStatus = typeof bookingStatuses.$inferSelect;
export type InsertBookingStatus = z.infer<typeof insertBookingStatusSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Status constants
export const TEST_STATUSES = {
  BOOKED: "booked",
  SAMPLE_COLLECTED: "sample_collected",
  PROCESSING: "processing",
  ANALYZING: "analyzing",
  COMPLETED: "completed",
};

// Collection type constants
export const COLLECTION_TYPES = {
  HOME: "home",
  LAB: "lab",
};

// Lab management
export const labs = pgTable("labs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  licenseNumber: text("license_number").notNull(),
  status: text("status", { enum: ["active", "inactive", "pending"] }).notNull().default("pending"),
  subscriptionPlan: text("subscription_plan", { enum: ["basic", "standard", "premium"] }).notNull().default("basic"),
  subscriptionStartDate: timestamp("subscription_start_date").defaultNow(),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(), // Reference to superadmin who created the lab
});

export const insertLabSchema = createInsertSchema(labs).pick({
  name: true,
  address: true,
  phone: true,
  email: true,
  licenseNumber: true,
  status: true,
  subscriptionPlan: true,
  subscriptionStartDate: true,
  subscriptionEndDate: true,
  createdBy: true,
});

// Type for labs
export type Lab = typeof labs.$inferSelect;
export type InsertLab = z.infer<typeof insertLabSchema>;

// Wearable device data schema
export const wearableDevices = pgTable("wearable_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  deviceType: text("device_type").notNull(), // e.g., fitbit, apple_watch, garmin, etc.
  deviceId: text("device_id").notNull(), // unique identifier for the device
  deviceName: text("device_name"),
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  accessToken: text("access_token"), // OAuth token for device API
  refreshToken: text("refresh_token"), // Refresh token for device API
  tokenExpiresAt: timestamp("token_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWearableDeviceSchema = createInsertSchema(wearableDevices).pick({
  userId: true,
  deviceType: true,
  deviceId: true,
  deviceName: true,
  accessToken: true,
  refreshToken: true,
  tokenExpiresAt: true,
  lastSyncedAt: true,
  isActive: true,
});

export const wearableData = pgTable("wearable_data", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => wearableDevices.id),
  dataType: text("data_type").notNull(), // e.g., heart_rate, steps, sleep, etc.
  recordedAt: timestamp("recorded_at").notNull(),
  value: text("value").notNull(), // JSON string of the data
  unit: text("unit"), // e.g., bpm, steps, hours, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWearableDataSchema = createInsertSchema(wearableData).pick({
  deviceId: true,
  dataType: true,
  recordedAt: true,
  value: true,
  unit: true,
});

export type WearableDevice = typeof wearableDevices.$inferSelect;
export type InsertWearableDevice = z.infer<typeof insertWearableDeviceSchema>;

export type WearableData = typeof wearableData.$inferSelect;
export type InsertWearableData = z.infer<typeof insertWearableDataSchema>;

export const WEARABLE_DEVICE_TYPES = {
  FITBIT: "fitbit",
  APPLE_WATCH: "apple_watch",
  GARMIN: "garmin",
  SAMSUNG_HEALTH: "samsung_health",
  GOOGLE_FIT: "google_fit",
  OTHER: "other"
} as const;

export const WEARABLE_DATA_TYPES = {
  HEART_RATE: "heart_rate",
  STEPS: "steps",
  SLEEP: "sleep",
  ACTIVITY: "activity",
  CALORIES: "calories",
  BLOOD_PRESSURE: "blood_pressure",
  BLOOD_GLUCOSE: "blood_glucose",
  WEIGHT: "weight",
  OXYGEN_SATURATION: "oxygen_saturation",
  TEMPERATURE: "temperature"
} as const;
