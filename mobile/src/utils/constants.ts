export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.0.2.2:5000/api";

export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  STAFF: "staff",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
