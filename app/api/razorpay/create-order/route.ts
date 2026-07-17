import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/razorpay/create-order
 *
 * Server-side API route that creates a Razorpay Order using the secret key.
 * Returns the Razorpay order_id for use in the client-side checkout options.
 *
 * This route is used for TEST MODE only.
 * The Razorpay Order API: https://razorpay.com/docs/api/orders/
 *
 * Request body:
 *   { amount: number (in INR), currency: string }
 *
 * Response:
 *   { orderId: string }   on success
 *   { error: string }     on failure
 */
export async function POST(request: NextRequest) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Graceful degradation: if secret is not configured, return 501
  if (!keyId || !keySecret) {
    return NextResponse.json(
      {
        error:
          "Razorpay API keys not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local.",
        configured: false,
      },
      { status: 501 }
    );
  }

  let body: { amount?: number; currency?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { amount, currency = "INR" } = body;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "amount is required and must be a positive number (in INR)." },
      { status: 400 }
    );
  }

  try {
    // Basic auth with key_id:key_secret
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        // Razorpay expects amount in smallest unit (paise for INR)
        amount: Math.round(amount * 100),
        currency,
        // receipt is optional but useful for internal reference
        receipt: `receipt_${Date.now()}`,
      }),
    });

    if (!razorpayResponse.ok) {
      const errorBody = await razorpayResponse.json().catch(() => ({}));
      console.error("[Razorpay] Order creation failed:", errorBody);
      return NextResponse.json(
        { error: "Failed to create Razorpay order.", details: errorBody },
        { status: 502 }
      );
    }

    const razorpayOrder = await razorpayResponse.json();

    return NextResponse.json(
      { orderId: razorpayOrder.id },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Razorpay] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error while creating order." },
      { status: 500 }
    );
  }
}
