import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const ALLOWED_NEXT_PREFIXES = ["/account", "/booking", "/book"];

function safeRedirect(next: string | null, fallback: string): string {
  if (!next) return fallback;
  return ALLOWED_NEXT_PREFIXES.some((p) => next.startsWith(p)) ? next : fallback;
}

function noCors(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "null");
  response.headers.set("Access-Control-Allow-Methods", "GET");
  response.headers.set("Vary", "Origin");
  return response;
}

/**
 * Magic-link callback. Supabase email links redirect here with ?code=…
 * We exchange the code for a session, then forward to the intended page.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeRedirect(url.searchParams.get("next"), "/account");

  if (!code || !isSupabaseConfigured()) {
    return noCors(NextResponse.redirect(new URL("/account/login", request.url)));
  }
  const sb = await createClient();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    return noCors(NextResponse.redirect(
      new URL(`/account/login?error=${encodeURIComponent(error.message)}`, request.url)
    ));
  }
  return noCors(NextResponse.redirect(new URL(next, request.url)));
}
