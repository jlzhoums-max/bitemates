import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/auth/callback"]);
const PUBLIC_PREFIXES = ["/invite/"];
const AUTHED_BOUNCE_PATHS = new Set(["/", "/login", "/signup"]);

function isPublic(pathname: string) {
  return (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getUser() so the proxy and the dashboard's auth check agree. getClaims()
  // can pass for a still-valid JWT whose server-side session is gone — proxy
  // would then bounce /login → /dashboard while dashboard bounces back, looping.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = !!user;

  const { pathname } = request.nextUrl;

  if (isAuthed && AUTHED_BOUNCE_PATHS.has(pathname)) {
    return carryCookies(response, NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  if (!isAuthed && !isPublic(pathname)) {
    return carryCookies(response, NextResponse.redirect(new URL("/login", request.url)));
  }

  return response;
}

// Preserve any refreshed session cookies onto a redirect response. Without
// this, a refresh that happens inside getClaims() would be discarded and the
// browser would retry with the already-consumed (single-use) refresh token.
function carryCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => to.cookies.set(c));
  return to;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$).*)",
  ],
};
