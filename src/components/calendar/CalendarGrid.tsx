'use client';

import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Event } from '@/types';

interface CalendarGridProps {
  currentDate: Date;
  events: Event[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: Event) => void;
}

export default function CalendarGrid({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}: CalendarGridProps) {
  const calendarRef = useRef<FullCalendar>(null);

  // Map our events to FullCalendar format
  const fcEvents = events.map((e) => ({
    id: String(e.id),
    title: `${e.reminder_minutes > 0 ? '🔔' : ''}${e.person ? `[${e.person}]` : ''} ${e.title}`,
    start: e.start_time
      ? `${e.event_date}T${e.start_time}`
      : e.event_date,
    end: e.end_time
      ? `${e.event_date}T${e.end_time}`
      : undefined,
    allDay: !e.start_time,
    backgroundColor: e.color || '#3B82F6',
    borderColor: e.color || '#3B82F6',
    textColor: '#fff',
    extendedProps: { event: e },
  }));

  return (
    <div className="fc-custom-theme">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialDate={currentDate}
        initialView="dayGridMonth"
        events={fcEvents}
        headerToolbar={{
          left: 'title',
          center: '',
          right: 'prev,today,next',
        }}
        buttonText={{
          today: '今天',
          prev: '‹',
          next: '›',
        }}
        height="auto"
        firstDay={0}
        weekNumbers={false}
        dayMaxEvents={3}
        locale="zh-cn"
        timeZone="local"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        dateClick={(info) => {
          onDateClick?.(new Date(info.dateStr + 'T12:00:00'));
        }}
        eventClick={(info) => {
          const event = info.event.extendedProps.event as Event;
          onEventClick?.(event);
        }}
      />
    </div>
  );
}
