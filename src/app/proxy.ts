import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  const session = await auth();

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/signin", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If not authenticated and trying to access protected route, redirect to signin
  if (!session && !isPublicRoute && pathname !== "/") {
    const signInUrl = new URL("/auth/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // If authenticated and trying to access signin, redirect to dashboard
  if (session && pathname === "/auth/signin") {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
