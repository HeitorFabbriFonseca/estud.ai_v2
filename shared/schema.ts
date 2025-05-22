import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  profilePicture: text("profile_picture"),
  phoneNumber: text("phone_number"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  profilePicture: true,
  phoneNumber: true,
});

// User preferences schema
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  studyTimePreferences: json("study_time_preferences").notNull(), // "morning", "afternoon", "evening", "weekend"
  hoursPerWeek: text("hours_per_week").notNull(), // "Less than 5 hours", "5-10 hours", etc.
  learningStyle: text("learning_style").notNull(), // "visual", "reading", "practical"
  defaultCalendar: text("default_calendar"), // "Primary Calendar", "Work", etc.
  setReminders: boolean("set_reminders").default(true),
  calendarConnected: boolean("calendar_connected").default(false),
  calendarEmail: text("calendar_email"),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  studyTimePreferences: true,
  hoursPerWeek: true,
  learningStyle: true,
  defaultCalendar: true,
  setReminders: true,
  calendarConnected: true,
  calendarEmail: true,
});

// Study plan schema
export const studyPlans = pgTable("study_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  duration: text("duration").notNull(), // e.g. "8 weeks"
  hoursPerWeek: integer("hours_per_week").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  schedule: text("schedule"), // e.g. "Mon, Wed, Fri (2h) + Sat (4h)"
  currentFocus: text("current_focus"),
  status: text("status").notNull().default("in_progress"), // "in_progress", "completed", "abandoned"
  colorScheme: text("color_scheme").default("blue"), // For UI display: "blue", "purple", etc.
  addedToCalendar: boolean("added_to_calendar").default(false),
  calendarEventIds: json("calendar_event_ids").$type<string[]>().default([]),
  content: json("content").notNull(), // The full study plan content
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStudyPlanSchema = createInsertSchema(studyPlans).pick({
  userId: true,
  title: true,
  description: true,
  duration: true,
  hoursPerWeek: true,
  startDate: true,
  endDate: true,
  schedule: true,
  currentFocus: true,
  status: true,
  colorScheme: true,
  addedToCalendar: true,
  calendarEventIds: true,
  content: true,
});

// Chat message schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  studyPlanId: integer("study_plan_id"),
  role: text("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  studyPlanId: true,
  role: true,
  content: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferencesSchema>;

export type StudyPlan = typeof studyPlans.$inferSelect;
export type InsertStudyPlan = z.infer<typeof insertStudyPlanSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
