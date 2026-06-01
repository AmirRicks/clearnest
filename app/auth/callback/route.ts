import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Magic-link callback. Supabase email links redirect here with ?code=…
 * We exchange the code for a session, then forward to the intended page.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/account";

  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/account/login", request.url));
  }
  const sb = await createClient();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/account/login?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
  return NextResponse.redirect(new URL(next, request.url));
}
