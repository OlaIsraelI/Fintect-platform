import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  if (isApiRoute) {
    return NextResponse.next();
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthPage && !token && request.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/api/:path*"],
};
