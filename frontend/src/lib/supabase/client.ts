import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for use in browser (Client Components).
 *
 * Usage:
 *   const supabase = createClient();
 *   const { data, error } = await supabase.auth.signInWithPassword({ ... });
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
