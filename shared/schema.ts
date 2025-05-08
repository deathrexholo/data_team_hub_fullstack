import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  title: text("title"),
  department: text("department"),
  profileImage: text("profile_image"),
  skills: text("skills").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meeting model
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(),
  location: text("location"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meeting participants
export const meetingParticipants = pgTable("meeting_participants", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, declined
});

// Post model
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull(),
  mediaUrls: text("media_urls").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comment model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Like model
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notification model
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // meeting, post, comment, etc.
  content: text("content").notNull(),
  referenceId: integer("reference_id"), // meeting_id, post_id, etc.
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for inserting a user
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Schema for inserting a meeting
export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true
});

// Schema for inserting a meeting participant
export const insertMeetingParticipantSchema = createInsertSchema(meetingParticipants).omit({
  id: true
});

// Schema for inserting a post
export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true
});

// Schema for inserting a comment
export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true
});

// Schema for inserting a like
export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true
});

// Schema for inserting a notification
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;

export type MeetingParticipant = typeof meetingParticipants.$inferSelect;
export type InsertMeetingParticipant = z.infer<typeof insertMeetingParticipantSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
