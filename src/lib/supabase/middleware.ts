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

  // Helper to determine destination based on role & onboarding
  const getRoleDashboard = () => {
    const cookieRole = request.cookies.get("triplet_active_dashboard_role")?.value;
    const metaRole = user?.user_metadata?.role;
    const effectiveRole = cookieRole || metaRole;

    const isFreelancerOnboarded =
      !!user?.user_metadata?.freelancer_onboarded ||
      (!!user?.user_metadata?.onboarding_completed && user?.user_metadata?.role === "freelancer");
    const isClientOnboarded =
      !!user?.user_metadata?.client_onboarded ||
      (!!user?.user_metadata?.onboarding_completed &&
        (user?.user_metadata?.role === "customer" || user?.user_metadata?.role === "client"));

    if (effectiveRole === "freelancer") {
      if (isFreelancerOnboarded || isDev) {
        return "/freelancer/dashboard";
      }
      return "/onboarding?role=freelancer";
    }

    if (effectiveRole === "customer" || effectiveRole === "client") {
      if (isClientOnboarded || isDev) {
        return "/client/dashboard";
      }
      return "/onboarding?role=customer";
    }

    if (isFreelancerOnboarded && !isClientOnboarded) {
      return "/freelancer/dashboard";
    }

    // Default to client dashboard
    return "/client/dashboard";
  };

  // Root landing page: if already logged in, redirect directly to role dashboard
  if (request.nextUrl.pathname === "/" && user) {
    return NextResponse.redirect(new URL(getRoleDashboard(), request.url));
  }

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
    return NextResponse.redirect(new URL(getRoleDashboard(), request.url));
  }

  // Handle /onboarding access: allow if target role has not completed onboarding
  if (request.nextUrl.pathname.startsWith("/onboarding") && user) {
    const roleParam = request.nextUrl.searchParams.get("role");
    const isFreelancerOnboarded =
      !!user.user_metadata?.freelancer_onboarded ||
      (!!user.user_metadata?.onboarding_completed && user.user_metadata?.role === "freelancer");
    const isClientOnboarded =
      !!user.user_metadata?.client_onboarded ||
      (!!user.user_metadata?.onboarding_completed &&
        (user.user_metadata?.role === "customer" || user.user_metadata?.role === "client"));

    // Allow onboarding if the requested role has not been onboarded yet
    if (roleParam === "freelancer" && !isFreelancerOnboarded) {
      return response;
    }
    if ((roleParam === "customer" || roleParam === "client") && !isClientOnboarded) {
      return response;
    }

    const isBothOnboarded = isFreelancerOnboarded && isClientOnboarded;
    const isInitialOnboarded = !!user.user_metadata?.onboarding_completed;

    if ((isBothOnboarded || (isInitialOnboarded && !roleParam)) && !isDev) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Role Dashboard Route Protection: ensure user has completed onboarding for the accessed role
  if (request.nextUrl.pathname.startsWith("/freelancer") && user) {
    const isFreelancerOnboarded =
      !!user.user_metadata?.freelancer_onboarded ||
      (!!user.user_metadata?.onboarding_completed && user.user_metadata?.role === "freelancer");
    if (!isFreelancerOnboarded) {
      return NextResponse.redirect(new URL("/onboarding?role=freelancer", request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith("/client") && user) {
    const isClientOnboarded =
      !!user.user_metadata?.client_onboarded ||
      (!!user.user_metadata?.onboarding_completed &&
        (user.user_metadata?.role === "customer" || user.user_metadata?.role === "client"));
    if (!isClientOnboarded) {
      return NextResponse.redirect(new URL("/onboarding?role=customer", request.url));
    }
  }

  return response;
}
