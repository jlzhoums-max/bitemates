import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingProfileForm } from "./form";

const AUTO_USERNAME = /^user_[0-9a-f]{8}$/;

export default async function OnboardingProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login?error=profile_missing");
  }

  if (!AUTO_USERNAME.test(profile.username)) {
    redirect("/dashboard");
  }

  return <OnboardingProfileForm currentDisplayName={profile.display_name} />;
}
