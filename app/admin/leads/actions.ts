"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLeadStatus(id: string, newStatus: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("[Leads] Failed to update status:", error);
    return { ok: false, error: "Failed to update lead status." };
  }

  revalidatePath("/admin/leads");
  return { ok: true };
}
