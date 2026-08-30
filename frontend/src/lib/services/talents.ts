import { createClient } from "@/lib/supabase/client";

export interface TalentRecord {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  coverImage?: string;
  role: string;
  headline: string;
  organization?: string;
  location?: string;
  level: "Verified Pro" | "Top Rated" | "Rising Star" | "Level 2 Seller";
  category: string;
  rating: number;
  reviewsCount: number;
  completedProjects?: number;
  startingPrice: string;
  hourlyRate: string;
  hourlyRateNumeric?: number;
  skills: string[];
  verifiedSkills?: string[];
  isVerified: boolean;
  aboutMe?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

/**
 * Fetch all freelancer profiles joined with users
 */
export async function getTalents(): Promise<TalentRecord[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("freelancer_profiles")
    .select(`
      *,
      user:users!user_id(id, full_name, avatar_url, location, is_verified, bio)
    `)
    .order("rating", { ascending: false });

  if (error || !data) {
    console.error("Error fetching talents from Supabase:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((t: any) => formatTalentRecord(t));
}

/**
 * Fetch a single freelancer talent profile by user ID
 */
export async function getTalentById(userId: string): Promise<TalentRecord | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("freelancer_profiles")
    .select(`
      *,
      user:users!user_id(id, full_name, avatar_url, location, is_verified, bio)
    `)
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .maybeSingle();

  if (error || !data) {
    console.error("Error fetching talent by ID:", error);
    return null;
  }

  return formatTalentRecord(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTalentRecord(t: any): TalentRecord {
  const user = t.user || {};
  return {
    id: t.id,
    userId: t.user_id,
    name: user.full_name || "Talenta Doable!",
    avatar: user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    coverImage: t.cover_image || "https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop&q=80",
    role: t.headline?.split("|")[0]?.trim() || t.category || "Fullstack Engineer",
    headline: t.headline || user.bio || "Digital Talent di Ekosistem Doable!",
    organization: t.organization || "Indonesia Digital Talent",
    location: user.location || "Indonesia",
    level: (t.badge_level as "Verified Pro" | "Top Rated" | "Rising Star") || "Verified Pro",
    category: t.category || "Web Development",
    rating: Number(t.rating) || 5.0,
    reviewsCount: t.reviews_count || 0,
    completedProjects: t.completed_projects || 0,
    startingPrice: t.starting_price || (t.hourly_rate ? `Rp ${(t.hourly_rate * 20).toLocaleString("id-ID")}` : "Rp 2.500.000"),
    hourlyRate: t.hourly_rate ? `Rp ${t.hourly_rate.toLocaleString("id-ID")} / jam` : "Rp 150.000 / jam",
    hourlyRateNumeric: t.hourly_rate || 150000,
    skills: t.skills || [],
    verifiedSkills: t.verified_skills || [],
    isVerified: Boolean(user.is_verified),
    aboutMe: t.about_me || [],
    githubUrl: t.github_url,
    linkedinUrl: t.linkedin_url,
    portfolioUrl: t.portfolio_url,
  };
}
