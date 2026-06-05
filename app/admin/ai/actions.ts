"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function getDb() {
  const db = createAdminClient();
  if (!db) throw new Error("Supabase not configured");
  return db;
}

export async function updateTicketStatus(
  id: string,
  status: string,
  type: "ticket" | "refund" = "ticket",
) {
  const db = await getDb();
  const table = type === "refund" ? "refund_requests" : "support_tickets";

  const { error } = await db
    .from(table)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/ai/tickets");
  revalidatePath("/admin/ai/refunds");
}

export async function addAdminNote(
  id: string,
  note: string,
  type: "ticket" | "refund" = "refund",
) {
  const db = await getDb();
  const table = type === "refund" ? "refund_requests" : "support_tickets";

  const { error } = await db
    .from(table)
    .update({ admin_notes: note, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/ai/refunds");
}
