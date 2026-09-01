import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Update the Supabase session in middleware.
 * This refreshes the auth token and sets updated cookies.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase credentials are missing or placeholders, allow navigation without auth check
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project-id") ||
    supabaseAnonKey.includes("your-anon-key")
  ) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — this is important for keeping the session alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDev = process.env.NODE_ENV === "development";

  // Protected routes: redirect to login if not authenticated
  const protectedPaths = ["/dashboard", "/onboarding", "/client", "/freelancer"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // In development mode, allow direct access to protected routes for UI designing and auditing without login
  if (isProtected && !user && !isDev) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes: redirect if already authenticated
  const authPaths = ["/login", "/register"];
  const isAuthRoute = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthRoute && user) {
    const isOnboarded = user.user_metadata?.onboarding_completed;
    return NextResponse.redirect(
      new URL(isOnboarded ? "/dashboard" : "/onboarding", request.url)
    );
  }

  // If already onboarded, redirect away from /onboarding to /dashboard (bypassed in dev mode)
  if (request.nextUrl.pathname.startsWith("/onboarding") && user) {
    const isOnboarded = user.user_metadata?.onboarding_completed;
    if (isOnboarded && !isDev) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}
