import { createClient } from "@/lib/supabase/client";

export interface TalentFilterOptions {
  searchQuery?: string;
  category?: string;
  level?: string;
  rateTier?: string;
  sortBy?: "rating" | "reviews" | "rate_asc" | "rate_desc" | "name";
  excludeUserId?: string;
}

export interface TalentRecord {
  id: string;
  userId: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: string; // Backward-compatible alias for startingPrice
  hourlyRateNumeric: number;
  startingPrice?: string;
  startingPriceNumeric?: number;
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
  coverImage?: string;
}

/**
 * Fetch all freelancers from Supabase freelancer_profiles joined with users
 */
export async function getTalents(filters?: TalentFilterOptions): Promise<TalentRecord[]> {
  const supabase = createClient();

  let excludeUserId = filters?.excludeUserId;
  let excludeEmail: string | undefined;

  // 1. Check synchronously from localStorage if in browser
  if (!excludeUserId && typeof window !== "undefined") {
    excludeUserId = localStorage.getItem("doable_current_user_id") || undefined;
  }

  // 2. Check local session from Supabase Auth
  if (!excludeUserId) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        excludeUserId = sessionData.session.user.id;
        excludeEmail = sessionData.session.user.email;
      }
    } catch {
      // ignore
    }
  }

  // 3. Check getUser from Supabase Auth
  if (!excludeUserId) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        excludeUserId = authData.user.id;
        excludeEmail = authData.user.email;
      }
    } catch {
      // ignore
    }
  }

  let query = supabase
    .from("freelancer_profiles")
    .select(`
      *,
      user:users!user_id(id, full_name, avatar_url, location, is_verified, bio, email, role, freelancer_onboarded)
    `);

  if (filters?.level && filters.level !== "All" && filters.level !== "Semua Level") {
    query = query.eq("badge_level", filters.level);
  }

  if (filters?.category && filters.category !== "All" && filters.category !== "Semua" && filters.category !== "Semua Kategori") {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching talents from Supabase:", error);
    return [];
  }

  // Filter only profiles whose user is actually a freelancer or has onboarded as freelancer, and deduplicate by user ID
  const seenUserIds = new Set<string>();
  const activeFreelancers = data.filter((item) => {
    const rawUser = item.user;
    const user = (Array.isArray(rawUser) ? rawUser[0] : rawUser) || {};
    if (!user || (!user.id && !item.user_id)) return false;

    if (user.role === "customer" && !user.freelancer_onboarded) {
      return false;
    }

    const uid = user.id || item.user_id;
    if (!uid || seenUserIds.has(uid)) {
      return false;
    }

    // Never show current logged in client/user in candidate talent search
    if (
      excludeUserId &&
      (uid === excludeUserId || item.user_id === excludeUserId || item.id === excludeUserId)
    ) {
      return false;
    }

    if (excludeEmail && user.email && user.email.toLowerCase() === excludeEmail.toLowerCase()) {
      return false;
    }

    seenUserIds.add(uid);
    return true;
  });

  let results: TalentRecord[] = activeFreelancers.map((item) => {
    const rawUser = item.user;
    const user = (Array.isArray(rawUser) ? rawUser[0] : rawUser) || {};
    const rateNum = Number(item.hourly_rate) > 1000
      ? Number(item.hourly_rate)
      : Number(item.hourly_rate) > 0
      ? Number(item.hourly_rate) * 50000
      : 500000;

    let formattedPrice = `Mulai Rp ${rateNum.toLocaleString("id-ID")}`;
    if (item.starting_price && typeof item.starting_price === "string" && !item.starting_price.includes("Jam") && !item.starting_price.includes("Minggu")) {
      formattedPrice = item.starting_price.startsWith("Rp") || item.starting_price.startsWith("Mulai")
        ? item.starting_price
        : `Mulai Rp ${Number(item.starting_price.replace(/\D/g, "") || rateNum).toLocaleString("id-ID")}`;
    }

    return {
      id: user.id || item.id,
      userId: user.id || item.user_id,
      name: user.full_name || "Specialist Talent",
      title: item.headline || "Digital Specialist",
      avatar: (user.avatar_url && !user.avatar_url.includes("photo-1534528741775")) ? user.avatar_url : "/images/default-avatar.svg",
      coverImage: item.cover_image || "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80",
      rating: Number(item.rating) || 5.0,
      reviewsCount: item.reviews_count || 0,
      hourlyRate: formattedPrice,
      hourlyRateNumeric: rateNum,
      startingPrice: formattedPrice,
      startingPriceNumeric: rateNum,
      location: user.location || "Indonesia",
      verified: Boolean(user.is_verified),
      badgeLevel: item.badge_level || (user.is_verified ? "Verified Pro" : "Talenta Muda"),
      skills: item.skills && item.skills.length > 0 ? item.skills : ["UI/UX Design", "Web Development"],
      bio: user.bio || item.headline || "Siap berkolaborasi dan mengerjakan proyek berkualitas tinggi.",
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

  if (filters?.rateTier && filters.rateTier !== "all" && filters.rateTier !== "Semua") {
    if (filters.rateTier === "tier-1" || filters.rateTier === "< 150k" || filters.rateTier === "< 500k") {
      results = results.filter((t) => t.hourlyRateNumeric < 500000);
    } else if (filters.rateTier === "tier-2" || filters.rateTier === "150k - 300k" || filters.rateTier === "500k - 2m") {
      results = results.filter(
        (t) => t.hourlyRateNumeric >= 500000 && t.hourlyRateNumeric <= 2000000
      );
    } else if (filters.rateTier === "tier-3" || filters.rateTier === "> 300k" || filters.rateTier === "> 2m") {
      results = results.filter((t) => t.hourlyRateNumeric > 2000000);
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
  if (user?.id && params.freelancerId === user.id) {
    return { success: false, error: "Anda tidak dapat mengundang diri sendiri ke proyek." };
  }

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
