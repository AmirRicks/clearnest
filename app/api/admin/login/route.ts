import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(rateLimitKey(request), { maxRequests: 5, windowMs: 30000 });
  if (!rl.allowed) {
    return NextResponse.redirect(
      new URL("/admin/login?error=Too many attempts. Try again in 30 seconds.", request.url)
    );
  }

  const formData = await request.formData();
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(
      new URL("/admin/login?error=Invalid email or password format.", request.url)
    );
  }

  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword(parsed.data);

  if (error) {
    return NextResponse.redirect(
      new URL("/admin/login?error=Invalid credentials.", request.url)
    );
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
