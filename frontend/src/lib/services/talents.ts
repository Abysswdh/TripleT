import { createClient } from "@/lib/supabase/client";

export interface TalentFilterOptions {
  searchQuery?: string;
  category?: string;
  level?: string;
  rateTier?: string;
  sortBy?: "rating" | "reviews" | "rate_asc" | "rate_desc" | "name";
}

export interface TalentRecord {
  id: string;
  userId: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: string;
  hourlyRateNumeric: number;
  location: string;
  verified: boolean;
  badgeLevel: string;
  skills: string[];
  bio: string;
  responseTime: string;
  completedProjects: number;
  totalEarnings: number;
  category: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

/**
 * Fetch all freelancers from Supabase freelancer_profiles joined with users
 */
export async function getTalents(filters?: TalentFilterOptions): Promise<TalentRecord[]> {
  const supabase = createClient();

  let query = supabase
    .from("freelancer_profiles")
    .select(`
      *,
      user:users!user_id(id, full_name, avatar_url, location, is_verified, bio, email)
    `);

  if (filters?.level && filters.level !== "All") {
    query = query.eq("badge_level", filters.level);
  }

  if (filters?.category && filters.category !== "All" && filters.category !== "Semua") {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching talents from Supabase:", error);
    return [];
  }

  let results: TalentRecord[] = data.map((item) => {
    const user = item.user || {};
    const rateNum = Number(item.hourly_rate) || 35;
    return {
      id: user.id || item.id,
      userId: user.id || item.user_id,
      name: user.full_name || "Specialist Talent",
      title: item.headline || "Digital Specialist",
      avatar: user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      rating: Number(item.rating) || 5.0,
      reviewsCount: item.reviews_count || 0,
      hourlyRate: item.starting_price || `$${rateNum}/hr`,
      hourlyRateNumeric: rateNum,
      location: user.location || "Indonesia",
      verified: user.is_verified ?? true,
      badgeLevel: item.badge_level || "Verified Pro",
      skills: item.skills || [],
      bio: user.bio || item.headline || "",
      responseTime: item.response_time || "< 1 jam",
      completedProjects: item.completed_projects || 0,
      totalEarnings: item.total_earnings || 0,
      category: item.category || "Full-Stack Web & Next.js",
      githubUrl: item.github_url,
      linkedinUrl: item.linkedin_url,
      portfolioUrl: item.portfolio_url,
    };
  });

  // Apply in-memory filters for flexible search & rate tiers
  if (filters?.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.bio.toLowerCase().includes(q) ||
        t.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (filters?.rateTier && filters.rateTier !== "all") {
    if (filters.rateTier === "tier-1") {
      // Under $25 / 150k
      results = results.filter((t) => t.hourlyRateNumeric < 25);
    } else if (filters.rateTier === "tier-2") {
      // $25 - $40 / 150k - 300k
      results = results.filter((t) => t.hourlyRateNumeric >= 25 && t.hourlyRateNumeric <= 40);
    } else if (filters.rateTier === "tier-3") {
      // Above $40 / > 300k
      results = results.filter((t) => t.hourlyRateNumeric > 40);
    }
  }

  // Sorting
  if (filters?.sortBy) {
    if (filters.sortBy === "rating") {
      results.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === "reviews") {
      results.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else if (filters.sortBy === "rate_asc") {
      results.sort((a, b) => a.hourlyRateNumeric - b.hourlyRateNumeric);
    } else if (filters.sortBy === "rate_desc") {
      results.sort((a, b) => b.hourlyRateNumeric - a.hourlyRateNumeric);
    } else if (filters.sortBy === "name") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return results;
}

/**
 * Send a project invitation from a client to a freelancer
 */
export async function inviteTalentToProject(params: {
  projectId: string;
  freelancerId: string;
  message?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const clientId = user?.id || "ca000000-0000-0000-0000-000000000001";

  const { error } = await supabase.from("talent_invitations").insert({
    project_id: params.projectId,
    client_id: clientId,
    freelancer_id: params.freelancerId,
    message: params.message || "Hi! I would like to invite you to propose for our project.",
    status: "pending",
  });

  if (error) {
    console.error("Error sending talent invitation:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
