import { createClient } from "@/lib/supabase/client";

export interface ReviewRecord {
  id: string;
  contract_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  is_public: boolean;
  created_at: string;
  reviewer?: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

export interface SubmitReviewParams {
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

/**
 * Submit or update a client review for a completed contract and recalculate
 * the freelancer's average rating and total review count in freelancer_profiles.
 */
export async function submitContractReview(
  params: SubmitReviewParams
): Promise<{ success: boolean; data?: ReviewRecord; error?: string }> {
  try {
    const cleanRating = Math.min(5, Math.max(1, Number(params.rating) || 5));
    const cleanComment = params.comment?.trim() || null;

    let savedReview: ReviewRecord | null = null;

    // 1. Primary: Use dedicated /api/reviews route to bypass any client-side RLS edge cases
    try {
      if (typeof window !== "undefined") {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractId: params.contractId,
            reviewerId: params.reviewerId,
            revieweeId: params.revieweeId,
            rating: cleanRating,
            comment: cleanComment,
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.data) {
            savedReview = resJson.data as ReviewRecord;
          }
        }
      }
    } catch (apiErr) {
      console.warn("[reviews] /api/reviews route call notice, falling back to direct client:", apiErr);
    }

    // 2. Fallback: Direct client upsert if API route was not used or failed
    if (!savedReview) {
      const supabase = createClient();
      const { data: insertedReview, error: reviewError } = await supabase
        .from("reviews")
        .upsert(
          {
            contract_id: params.contractId,
            reviewer_id: params.reviewerId,
            reviewee_id: params.revieweeId,
            rating: cleanRating,
            comment: cleanComment,
            is_public: true,
          },
          { onConflict: "contract_id,reviewer_id" }
        )
        .select()
        .single();

      if (reviewError) {
        console.error("[reviews] Failed to save review:", reviewError);
        return { success: false, error: reviewError.message };
      }

      savedReview = insertedReview as ReviewRecord;

      // Update freelancer_profiles stats (database trigger also handles this via SECURITY DEFINER)
      try {
        const { data: allReviews } = await supabase
          .from("reviews")
          .select("rating")
          .eq("reviewee_id", params.revieweeId);

        if (allReviews && allReviews.length > 0) {
          const totalScore = allReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
          const avgRating = Number((totalScore / allReviews.length).toFixed(1));
          const reviewsCount = allReviews.length;

          await supabase
            .from("freelancer_profiles")
            .update({
              rating: avgRating,
              reviews_count: reviewsCount,
            })
            .eq("user_id", params.revieweeId);
        }
      } catch (profErr) {
        console.warn("[reviews] Note: freelancer_profiles stats synced via DB trigger:", profErr);
      }
    }

    // 3. Dispatch global event so active profile/dashboard views re-sync
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("review-submitted", {
          detail: {
            contractId: params.contractId,
            revieweeId: params.revieweeId,
            rating: cleanRating,
          },
        })
      );
    }

    return { success: true, data: savedReview };
  } catch (err: unknown) {
    console.error("[reviews] Error in submitContractReview:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan ulasan.",
    };
  }
}

/**
 * Fetch existing review for a specific contract.
 */
export async function getContractReview(
  contractId: string,
  reviewerId?: string
): Promise<ReviewRecord | null> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("reviews")
      .select("*, reviewer:users!reviewer_id(id, full_name, avatar_url)")
      .eq("contract_id", contractId);

    if (reviewerId) {
      query = query.eq("reviewer_id", reviewerId);
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) return null;
    return data as ReviewRecord;
  } catch (err) {
    console.warn("[reviews] Could not get contract review:", err);
    return null;
  }
}

/**
 * Fetch all reviews received by a freelancer.
 */
export async function getFreelancerReviews(
  freelancerId: string
): Promise<ReviewRecord[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*, reviewer:users!reviewer_id(id, full_name, avatar_url)")
      .eq("reviewee_id", freelancerId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as ReviewRecord[];
  } catch (err) {
    console.warn("[reviews] Could not get freelancer reviews:", err);
    return [];
  }
}
