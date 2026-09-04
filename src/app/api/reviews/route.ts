import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contractId, reviewerId, revieweeId, rating, comment } = body;

    if (!contractId || !reviewerId || !revieweeId) {
      return NextResponse.json(
        { error: "Data ulasan tidak lengkap (contractId, reviewerId, revieweeId diperlukan)" },
        { status: 400 }
      );
    }

    const cleanRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const cleanComment = comment?.trim() || null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Upsert review
    const { data: reviewData, error: upsertErr } = await adminClient
      .from("reviews")
      .upsert(
        {
          contract_id: contractId,
          reviewer_id: reviewerId,
          reviewee_id: revieweeId,
          rating: cleanRating,
          comment: cleanComment,
          is_public: true,
        },
        { onConflict: "contract_id,reviewer_id" }
      )
      .select()
      .single();

    if (upsertErr) {
      console.error("[api/reviews] Upsert error:", upsertErr);
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    // 2. Recalculate average rating & reviews_count for freelancer_profiles
    const { data: allReviews } = await adminClient
      .from("reviews")
      .select("rating")
      .eq("reviewee_id", revieweeId);

    if (allReviews && allReviews.length > 0) {
      const totalScore = allReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
      const avgRating = Number((totalScore / allReviews.length).toFixed(1));
      const reviewsCount = allReviews.length;

      await adminClient
        .from("freelancer_profiles")
        .update({
          rating: avgRating,
          reviews_count: reviewsCount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", revieweeId);
    }

    return NextResponse.json({ success: true, data: reviewData });
  } catch (err: unknown) {
    console.error("[api/reviews] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan server saat menyimpan ulasan." },
      { status: 500 }
    );
  }
}
