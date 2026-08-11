/**
 * Image Host Configuration
 *
 * Defines allowed hostnames for Next.js Image component optimization
 * and client-side product image validation.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHost = "xdgxhytwfzyjjfxhyfzs.supabase.co";

if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    supabaseHost = url.hostname;
  } catch (err) {
    console.error("Failed to parse NEXT_PUBLIC_SUPABASE_URL:", err);
  }
}

export const ALLOWED_IMAGE_HOSTS = ["images.unsplash.com", supabaseHost];
