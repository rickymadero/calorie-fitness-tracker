import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeAppPath } from "@/lib/auth/pricingReturn";

/**
 * Exchanges an Auth code (email confirm / magic link / recovery) for a session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeAppPath(searchParams.get("next"), "/feed");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
