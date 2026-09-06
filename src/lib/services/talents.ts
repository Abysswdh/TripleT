import { createClient } from "@/lib/supabase/client";
import { createNotification } from "@/lib/services/notifications";

export interface TalentFilterOptions {
  searchQuery?: string;
  category?: string;
  level?: string;
  rateTier?: string;
  availability?: string;
  sortBy?: "rating" | "reviews" | "rate_asc" | "rate_desc" | "name";
  excludeUserId?: string;
}

export function parseTalentAvailability(raw?: string | null): {
  id: "part_time" | "semi_full" | "full_time" | "flexible";
  badge: string;
  hours: string;
  label: string;
} {
  if (!raw) {
    return {
      id: "semi_full",
      badge: "Part-Time",
      hours: "15–30 Jam / Mgg",
      label: "Part-Time Aktif",
    };
  }

  const val = String(raw).toLowerCase().trim();

  if (val === "part_time" || val.includes("part_time") || val.includes("< 15") || val.includes("side hustle")) {
    return {
      id: "part_time",
      badge: "Side Hustle",
      hours: "< 15 Jam / Mgg",
      label: "Side Hustle / Santai",
    };
  }

  if (val === "full_time" || val.includes("full_time") || val.includes("> 30") || val.includes("full-time")) {
    return {
      id: "full_time",
      badge: "Full-Time",
      hours: "> 30 Jam / Mgg",
      label: "Full-Time Freelancer",
    };
  }

  if (val === "flexible" || val.includes("flex") || val.includes("malam")) {
    return {
      id: "flexible",
      badge: "Fleksibel",
      hours: "Fleksibel",
      label: "Fleksibel / Malam",
    };
  }

  return {
    id: "semi_full",
    badge: "Part-Time",
    hours: "15–30 Jam / Mgg",
    label: "Part-Time Aktif",
  };
}

export interface TalentRecord {
  id: string;
  userId: string;
  name: string;
  title: string;
  avatar: string;
  rating: number | string;
  reviewsCount: number;
  hourlyRate: string; // Backward-compatible alias for startingPrice
  hourlyRateNumeric: number;
  startingPrice?: string;
  startingPriceNumeric?: number;
  weeklyAvailability?: "part_time" | "semi_full" | "full_time" | "flexible" | string;
  availability?: string;
  availabilityBadge?: string;
  availabilityHours?: string;
  availabilityLabel?: string;
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

    // Check if there's local settings cache for this user in browser
    let cachedSettings: any = null;
    if (typeof window !== "undefined") {
      try {
        const rawCache = localStorage.getItem(`triplet_freelancer_settings_${user.id || item.user_id}`);
        if (rawCache) cachedSettings = JSON.parse(rawCache);
      } catch {}
    }

    const rawStartingPrice = cachedSettings?.startingPrice || item.starting_price || (user as any)?.starting_price;
    const rawHourlyRate = cachedSettings?.hourlyRate || item.hourly_rate || (user as any)?.hourly_rate;

    let rateNum = 500000;
    if (rawStartingPrice && typeof rawStartingPrice === "string" && !rawStartingPrice.includes("Jam") && !rawStartingPrice.includes("Minggu")) {
      const parsed = Number(rawStartingPrice.replace(/\D/g, ""));
      if (parsed > 0) rateNum = parsed;
    } else if (typeof rawStartingPrice === "number" && rawStartingPrice > 0) {
      rateNum = rawStartingPrice;
    } else if (Number(rawHourlyRate) > 1000) {
      rateNum = Number(rawHourlyRate);
    } else if (Number(rawHourlyRate) > 0) {
      rateNum = Number(rawHourlyRate) * 50000;
    }

    let formattedPrice = `Mulai Rp ${rateNum.toLocaleString("id-ID")}`;
    if (rawStartingPrice && typeof rawStartingPrice === "string" && !rawStartingPrice.includes("Jam") && !rawStartingPrice.includes("Minggu")) {
      formattedPrice = rawStartingPrice.startsWith("Mulai")
        ? rawStartingPrice
        : rawStartingPrice.startsWith("Rp")
        ? `Mulai ${rawStartingPrice}`
        : `Mulai Rp ${rateNum.toLocaleString("id-ID")}`;
    }

    const rawAvail = cachedSettings?.weeklyAvailability || item.weekly_availability || item.availability || (user as any)?.weekly_availability || (user as any)?.availability;
    const availInfo = parseTalentAvailability(rawAvail);

    return {
      id: user.id || item.id,
      userId: user.id || item.user_id,
      name: user.full_name || "Specialist Talent",
      title: item.headline || "Digital Specialist",
      avatar: (user.avatar_url && !user.avatar_url.includes("photo-1534528741775")) ? user.avatar_url : "/images/default-avatar.svg",
      coverImage: item.cover_image || "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80",
      rating: (Number(item.reviews_count) > 0 && Number(item.rating) > 0) ? Number(Number(item.rating).toFixed(1)) : "-",
      reviewsCount: Number(item.reviews_count) || 0,
      hourlyRate: formattedPrice,
      hourlyRateNumeric: rateNum,
      startingPrice: formattedPrice,
      startingPriceNumeric: rateNum,
      weeklyAvailability: availInfo.id,
      availability: availInfo.label,
      availabilityBadge: availInfo.badge,
      availabilityHours: availInfo.hours,
      availabilityLabel: availInfo.label,
      location: user.location || "Indonesia",
      verified: Boolean(user.is_verified),
      badgeLevel: item.badge_level || (user.is_verified ? "Verified Pro" : "Talenta Muda"),
      skills: (cachedSettings?.skills && cachedSettings.skills.length > 0)
        ? cachedSettings.skills
        : (item.skills && item.skills.length > 0)
        ? item.skills
        : ["UI/UX Design", "Web Development"],
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

  if (filters?.availability && filters.availability !== "all" && filters.availability !== "Semua") {
    results = results.filter((t) => t.weeklyAvailability === filters.availability);
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
      results.sort((a, b) => {
        const aScore = a.reviewsCount > 0 && a.rating !== "-" ? Number(a.rating) : 0;
        const bScore = b.reviewsCount > 0 && b.rating !== "-" ? Number(b.rating) : 0;
        return bScore - aScore;
      });
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

  // Trigger notification for the invited freelancer
  try {
    const { data: proj } = await supabase
      .from("projects")
      .select("title")
      .eq("id", params.projectId)
      .maybeSingle();

    const { data: clientUser } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", clientId)
      .maybeSingle();

    const clientName = clientUser?.full_name || "Klien";
    const projTitle = proj?.title || "Proyek Rekomendasi";

    await createNotification({
      userId: params.freelancerId,
      type: "invitation",
      title: "Undangan Proyek Khusus ✉️",
      message: `${clientName} mengundang Anda untuk mengajukan penawaran pada proyek '${projTitle}'.`,
      linkUrl: `/freelancer/explore/${params.projectId}`,
      referenceType: "project",
      referenceId: params.projectId,
      roleTarget: "freelancer",
    });
  } catch (notifErr) {
    console.warn("Could not send talent invitation notification:", notifErr);
  }

  return { success: true };
}
