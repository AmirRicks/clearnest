import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    const sb = await createClient();
    await sb.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", request.url));
}
