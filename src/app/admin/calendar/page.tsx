'use client';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

import { useState, useEffect, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import Modal from '@/components/ui/Modal';
import EventForm from '@/components/calendar/EventForm';
import Button from '@/components/ui/button';
import { Spinner } from '@/components/ui/States';
import type { Event } from '@/types';

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [defaultDate, setDefaultDate] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadEvents = useCallback(() => {
    setLoading(true);
    const monthStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const monthEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    const start = format(monthStart, 'yyyy-MM-dd');
    const end = format(monthEnd, 'yyyy-MM-dd');

    fetchWithAuth(`/api/events?start=${start}&end=${end}`, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => {
        setEvents([]);
        setLoading(false);
      });
  }, [currentDate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  async function handleSave(data: {
    title: string;
    description: string;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    color: string;
    reminder_minutes: number;
    person: string;
  }) {
    setSaving(true);
    const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
    const method = editingEvent ? 'PUT' : 'POST';
    const res = await fetchWithAuth(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setEditingEvent(null);
      setShowNewForm(false);
      loadEvents();
    } else {
      const err = await res.json().catch(() => ({ error: '请求失败' }));
      alert(err.error || '操作失败');
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!editingEvent) return;
    setDeleting(true);
    const res = await fetchWithAuth(`/api/events/${editingEvent.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setEditingEvent(null);
      setDeleting(false);
      loadEvents();
    } else {
      const err = await res.json().catch(() => ({ error: '删除失败' }));
      alert(err.error || '删除失败');
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-200">日程管理</h1>
          <p className="text-sm text-stone-400 mt-0.5">管理家庭日程和重要日子</p>
        </div>
        <Button
          onClick={() => {
            setEditingEvent(null);
            setDefaultDate(format(new Date(), 'yyyy-MM-dd'));
            setShowNewForm(true);
          }}
        >
          添加日程
        </Button>
      </div>

      {/* Month nav — handled by FullCalendar */}

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          <CalendarGrid
            currentDate={currentDate}
            events={events}
            onDateClick={(date) => {
              setEditingEvent(null);
              setDefaultDate(format(date, 'yyyy-MM-dd'));
              setShowNewForm(true);
            }}
            onEventClick={(event) => {
              setEditingEvent(event);
              setDefaultDate('');
              setShowNewForm(true);
            }}
          />
        </div>
      )}

      {showNewForm && (
        <Modal
          open={showNewForm}
          onClose={() => {
            setShowNewForm(false);
            setEditingEvent(null);
          }}
          title={editingEvent ? '编辑日程' : '添加日程'}
          maxWidth="max-w-md"
        >
          <EventForm
            event={editingEvent || undefined}
            defaultDate={defaultDate}
            onSubmit={handleSave}
            onDelete={editingEvent ? handleDelete : undefined}
            loading={saving}
            deleting={deleting}
          />
        </Modal>
      )}
    </div>
  );
}
