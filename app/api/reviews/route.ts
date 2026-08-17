import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId || typeof reviewId !== "string") {
      return NextResponse.json({ error: "Invalid or missing reviewId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch product_id first to recalculate product rating summary
    const { data: reviewData } = await supabase
      .from("reviews")
      .select("product_id")
      .eq("id", reviewId)
      .single();

    // 2. Delete the review row using server admin client (bypassing client RLS limits)
    const { error, count } = await supabase
      .from("reviews")
      .delete({ count: "exact" })
      .eq("id", reviewId);

    if (error) {
      console.error("[API /api/reviews DELETE] Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Recalculate and update product rating if review was deleted
    if (reviewData && reviewData.product_id) {
      const productId = reviewData.product_id;
      const { data: remainingReviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", productId);

      const totalCount = remainingReviews ? remainingReviews.length : 0;
      const avgRating = totalCount > 0
        ? remainingReviews!.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / totalCount
        : 0;

      await (supabase as any)
        .from("products")
        .update({
          rating: parseFloat(avgRating.toFixed(1)),
          review_count: totalCount,
        })
        .eq("id", productId);
    }

    return NextResponse.json({ success: true, count: count || 0 });
  } catch (err: any) {
    console.error("[API /api/reviews DELETE] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
