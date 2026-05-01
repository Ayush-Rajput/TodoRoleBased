import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1)
});

export const projectSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().max(500).optional().nullable()
});

export const memberSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER")
});

export const taskSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().optional().nullable()
});

export const taskUpdateSchema = taskSchema.partial();
