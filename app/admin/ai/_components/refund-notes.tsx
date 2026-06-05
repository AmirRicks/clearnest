"use client";

import { useState, useTransition } from "react";
import { addAdminNote } from "../actions";

export function RefundAdminNotes({
  refundId,
  currentNotes,
}: {
  refundId: string;
  currentNotes: string;
}) {
  const [notes, setNotes] = useState(currentNotes);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      await addAdminNote(refundId, notes);
      setEditing(false);
    });
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-graphite hover:text-charcoal max-w-[150px] truncate text-left"
      >
        {notes || "Add note..."}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-28 rounded border border-stone/70 px-1.5 py-0.5 text-xs focus:outline-none focus:border-brand-400"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <button
        onClick={save}
        disabled={pending}
        className="text-xs text-brand-600 hover:underline disabled:opacity-50"
      >
        Save
      </button>
    </div>
  );
}
