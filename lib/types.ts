export type UserRole = "admin" | "user";

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}