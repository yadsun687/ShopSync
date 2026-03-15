import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const step1Schema = z.object({
  email: z.email("Invalid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const step2Schema = z.object({
  occupation: z.string().min(1, "Occupation is required"),
  company: z.string().min(1, "Company is required"),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
});
