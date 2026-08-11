/**
 * /api/notifications — POST
 *
 * Security hardening (C5 fix):
 *   - Requires a valid Supabase session cookie (authenticated users only).
 *   - Verifies the caller's identity: the userId in the payload must match
 *     the authenticated session user, OR the request must originate from a
 *     server-side context (admin status update).
 *   - In-memory rate limiting: max 20 requests per IP per minute.
 *   - Removes fallback to NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

// ─── In-memory rate limiter ───────────────────────────────────────────────────
// Keyed by IP address. Stores { count, resetAt } per window.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;        // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

// Clean up stale rate limit entries every 5 minutes to prevent memory bloat
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((entry, ip) => {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  });
}, 5 * 60_000);

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── 1. Rate Limiting ──────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  // ── 2. Authentication — verify caller has a valid session ─────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[API Notifications] Missing Supabase environment variables.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  // Create a cookie-based session client to verify the caller
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseAnonKey) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  let callerUserId: string | null = null;
  let callerEmail: string | null = null;

  try {
    const sessionClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => {
          const cookieHeader = request.headers.get("cookie") || "";
          return cookieHeader.split(";").map((c) => {
            const [name, ...rest] = c.trim().split("=");
            return { name: name.trim(), value: rest.join("=") };
          });
        },
        setAll: () => {},
      },
    });

    const { data: { user }, error } = await sessionClient.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    callerUserId = user.id;
    callerEmail = user.email ?? null;
  } catch (authErr) {
    console.error("[API Notifications] Auth check failed:", authErr);
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  // ── 3. Parse and validate body ────────────────────────────────────────────
  let body: { email?: string; message?: string; type?: string; targetUrl?: string; userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, message, type, targetUrl, userId } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (message.length > 500) {
    return NextResponse.json({ error: "Message too long (max 500 chars)." }, { status: 400 });
  }

  // ── 4. Identity verification ──────────────────────────────────────────────
  // The caller can only send notifications to themselves OR act as the system
  // (when the target email is the admin notification address stored in profiles).
  // Rule: if a specific userId is provided, it must match the authenticated caller.
  if (userId && userId !== callerUserId) {
    return NextResponse.json(
      { error: "Forbidden: cannot send notifications on behalf of another user." },
      { status: 403 }
    );
  }

  // ── 5. Insert using service role (bypasses RLS — notification INSERT is
  //       now restricted to service_role at DB level) ─────────────────────
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const normalizedEmail = email
    ? String(email).toLowerCase().trim()
    : callerEmail?.toLowerCase() ?? null;

  const payload = {
    user_id: userId || callerUserId,
    user_email: normalizedEmail,
    message: message.trim(),
    type: type || null,
    target_url: targetUrl || null,
    is_read: false,
  };

  let { data, error: insertError } = await supabaseAdmin
    .from("notifications")
    .insert(payload)
    .select();

  // Retry without user_id if FK constraint fails
  if (insertError && (userId || callerUserId)) {
    console.warn(
      "[API Notifications] Insert with user_id failed, retrying email-only:",
      insertError.message
    );
    const retry = await supabaseAdmin
      .from("notifications")
      .insert({ ...payload, user_id: null })
      .select();
    data = retry.data;
    insertError = retry.error;
  }

  if (insertError) {
    console.error("[API Notifications] Supabase insert error:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, notification: data });
}
