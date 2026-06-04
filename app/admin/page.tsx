import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminRootPage() {
  // The layout already protects this route, but as a good practice,
  // we can ensure non-admins are always bounced from the root.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  // If they are logged in, the most useful page is the leads dashboard.
  return redirect("/admin/leads");
}
