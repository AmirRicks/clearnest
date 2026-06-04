"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface AdminCalendarProps {
  initialEvents: any[];
}

export function AdminCalendar({ initialEvents }: AdminCalendarProps) {
  return (
    <div className="h-[80vh]">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={initialEvents}
        editable={true} // Allows dragging and resizing
        selectable={true}
        height="100%"
        // Add event handlers for drag-and-drop rescheduling in Phase 2
        // eventDrop={handleEventDrop}
        // select={handleSelect}
      />
    </div>
  );
}
