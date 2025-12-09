import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");
  const { pathname } = request.nextUrl;

  // Only handle redirects for auth pages when token exists
  // For all other routes, let the client-side handle authentication
  // This prevents redirect loops on page reload
  if ((pathname === "/signin" || pathname === "/signup") && token) {
    // If user has a token and tries to access signin/signup, redirect to dashboard
    // The client will verify the token is valid
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For all other routes (including protected routes), let the client handle it
  // The AdminLayout will show a loader while checking session and redirect if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif).*)",
  ],
};

