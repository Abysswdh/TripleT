/**
 * Doable! — Shared TypeScript Type Definitions
 */

// --- User ---

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  role: "freelancer" | "customer";
  skills: string[] | null;
  hourly_rate: number | null;
  starting_price?: string | null;
  experience_level: string | null;
  xp: number;
  streak_days: number;
  level: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUpdate {
  full_name?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  role?: "freelancer" | "customer";
  skills?: string[];
  hourly_rate?: number;
  starting_price?: string;
  experience_level?: string;
}

// --- Project ---

export type ProjectStatus = "draft" | "open" | "in_progress" | "completed" | "cancelled";
export type BudgetType = "fixed" | "milestone" | "hourly";

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string | null;
  required_skills: string[] | null;
  experience_level: string | null;
  budget_type: BudgetType;
  budget_min: number | null;
  budget_max: number | null;
  status: ProjectStatus;
  owner_id: string;
  freelancer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  title: string;
  description: string;
  category?: string;
  required_skills?: string[];
  experience_level?: string;
  budget_type?: BudgetType;
  budget_min?: number;
  budget_max?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

// --- API ---

export interface ApiErrorResponse {
  detail: string;
}
