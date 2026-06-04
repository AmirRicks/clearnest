"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createBookingFromLead } from "@/app/admin/leads/actions";
import type { Lead } from "./leads-table";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { BookingCalendar } from "@/components/booking-calendar";

export function ApproveModal({ lead, isOpen, setIsOpen }: { lead: Lead | null; isOpen: boolean; setIsOpen: (open: boolean) => void; }) {
  const [pending, startTransition] = useTransition();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", zip: "" });

  if (!lead) return null;

  const handleSubmit = async () => {
    if (!date || !time) {
      toast.error("Please select a date and time for the booking.");
      return;
    }
    if (!address.line1 || !address.city || !address.zip) {
      toast.error("Please enter a full address for the booking.");
      return;
    }

    startTransition(async () => {
      const result = await createBookingFromLead(lead, {
        scheduledFor: new Date(`${date}T${time}:00`).toISOString(),
        addressLine1: address.line1,
        addressLine2: address.line2,
        city: address.city,
        zip: address.zip,
      });
      if (result.ok) {
        toast.success("Booking created! The calendar has been updated.");
        setIsOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent className="max-w-4xl">
        <ModalHeader>
          <ModalTitle>Approve Lead & Create Booking</ModalTitle>
        </ModalHeader>
        <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-charcoal">Lead Details</h3>
            <p className="text-sm"><strong>Name:</strong> {lead.name}</p>
            <p className="text-sm"><strong>Phone:</strong> {lead.phone}</p>
            <p className="text-sm"><strong>Email:</strong> {lead.email}</p>
            <p className="text-sm"><strong>Message:</strong> {lead.message}</p>
            <p className="text-sm"><strong>Source:</strong> {lead.source}</p>

            <h3 className="font-semibold text-charcoal pt-4">Enter Address</h3>
             <input placeholder="Address Line 1" onChange={e => setAddress(a => ({...a, line1: e.target.value}))} className="w-full rounded-md border-stone-300"/>
             <input placeholder="Address Line 2 (optional)" onChange={e => setAddress(a => ({...a, line2: e.target.value}))} className="w-full rounded-md border-stone-300"/>
             <input placeholder="City" onChange={e => setAddress(a => ({...a, city: e.target.value}))} className="w-full rounded-md border-stone-300"/>
             <input placeholder="ZIP Code" onChange={e => setAddress(a => ({...a, zip: e.target.value}))} className="w-full rounded-md border-stone-300"/>
          </div>
          <div>
            <h3 className="font-semibold text-charcoal mb-4">Select Date & Time</h3>
            <BookingCalendar selectedDate={date} selectedTime={time} onSelect={(d,t) => { setDate(d); setTime(t); }} />
          </div>
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-full border">Cancel</button>
          <button onClick={handleSubmit} disabled={pending} className="px-4 py-2 rounded-full bg-charcoal text-white disabled:opacity-50">
            {pending ? <Loader2 className="animate-spin" /> : "Approve & Book"}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
