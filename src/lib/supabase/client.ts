import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for use in browser (Client Components).
 *
 * Usage:
 *   const supabase = createClient();
 *   const { data, error } = await supabase.auth.signInWithPassword({ ... });
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  if (
    typeof window !== "undefined" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project"))
  ) {
    console.error(
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL is missing or using placeholder! Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Project Settings > Environment Variables, then redeploy."
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
