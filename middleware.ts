import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "sg_allowed_username";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 ano em segundos

const PROTECTED_ROUTES = [/^\/vendas\/[^/]+$/, /^\/perfil\/[^/]+$/, /^\/dm\/[^/]+/];

function extractUsernameFromPath(pathname: string): string | null {
  for (const pattern of PROTECTED_ROUTES) {
    const match = pathname.match(pattern);
    if (match) {
      const parts = pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return parts[1];
      }
    }
  }
  return null;
}

function getCookieValue(request: NextRequest, name: string): string | null {
  return request.cookies.get(name)?.value || null;
}

function clearCookie(response: NextResponse, name: string): void {
  response.cookies.set({
    name,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

function redirectToAllowedUsername(
  request: NextRequest,
  allowedUsername: string,
): NextResponse {
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length >= 2) {
    parts[1] = allowedUsername;
    const newPath = "/" + parts.join("/");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return NextResponse.redirect(new URL(`/vendas/${allowedUsername}`, request.url));
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  const shouldResetUser = searchParams.get("resetUser") === "1";
  if (shouldResetUser) {
    const url = new URL(request.url);
    url.searchParams.delete("resetUser");
    const response = NextResponse.redirect(url);
    clearCookie(response, COOKIE_NAME);
    return response;
  }

  const username = extractUsernameFromPath(pathname);

  if (!username) {
    return NextResponse.next();
  }

  const allowedUsername = getCookieValue(request, COOKIE_NAME);

  if (allowedUsername && allowedUsername !== username) {
    return redirectToAllowedUsername(request, allowedUsername);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/vendas/:username*",
    "/perfil/:username*",
    "/dm/:username*",
  ],
};


