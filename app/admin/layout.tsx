import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Nav } from "./_components/nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/admin/login");
  }

  // A second check to see if they are in the `admins` table
  // The RLS policies are the true security boundary, but this prevents
  // any regular signed-in user from even seeing the admin layout.
  const { data: admin, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (error || !admin) {
    // Silently log them out and redirect.
    await supabase.auth.signOut();
    return redirect("/admin/login?error=Not authorized");
  }

  return (
    <div className="min-h-screen bg-paper/50">
      <Nav user={user} />
      <main className="container-tight py-8">{children}</main>
    </div>
  );
}
