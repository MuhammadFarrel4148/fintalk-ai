import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Fail-closed: anything not explicitly listed here is treated as protected.
// Add new public routes (e.g. /signup, /forgot-password) here as they're built.
const PUBLIC_ROUTES = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthenticated = Boolean(request.cookies.get("token")?.value);

  if (!isPublicRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
