import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const AUTO_USERNAME = /^user_[0-9a-f]{8}$/;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  // Prevent open-redirect: same-origin paths only.
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (profile && AUTO_USERNAME.test(profile.username)) {
      const onboardingUrl = new URL("/onboarding/profile", origin);
      onboardingUrl.searchParams.set("next", next);
      return NextResponse.redirect(onboardingUrl);
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
