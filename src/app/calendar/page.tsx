'use client';

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
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Spinner, SkeletonList } from '@/components/ui/States';
import Button from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import type { Event } from '@/types';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Event form state
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [defaultDate, setDefaultDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Check auth
  useEffect(() => {
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then((data) => setAuthenticated(!!data.authenticated))
      .catch(() => {});
  }, []);

  const loadEvents = useCallback(() => {
    setLoading(true);
    const monthStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const monthEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    const start = format(monthStart, 'yyyy-MM-dd');
    const end = format(monthEnd, 'yyyy-MM-dd');

    fetch(`/api/events?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events);
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
      credentials: 'include',
    });
    if (res.ok) {
      setEditingEvent(null);
      setShowForm(false);
      loadEvents();
    } else {
      const err = await res.json().catch(() => ({ error: '请求失败' }));
      alert(err.error || '操作失败');
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (deleteConfirmId === null) return;
    setDeleting(true);
    const res = await fetchWithAuth(`/api/events/${deleteConfirmId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setEvents(events.filter((e) => e.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      setEditingEvent(null);
      setShowForm(false);
    }
    setDeleting(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-200">日程</h1>
          <p className="text-sm text-stone-400 mt-0.5">家人的重要日子</p>
        </div>
        {authenticated && (
          <Button
            size="sm"
            onClick={() => {
              setEditingEvent(null);
              setDefaultDate(format(new Date(), 'yyyy-MM-dd'));
              setShowForm(true);
            }}
          >
            + 添加日程
          </Button>
        )}
      </div>

      {/* Month navigation — handled by FullCalendar */}

      {loading && events.length === 0 ? (
        <SkeletonList count={5} />
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          <CalendarGrid
            currentDate={currentDate}
            events={events}
            onDateClick={
              authenticated
                ? (date) => {
                    setEditingEvent(null);
                    setDefaultDate(format(date, 'yyyy-MM-dd'));
                    setShowForm(true);
                  }
                : undefined
            }
            onEventClick={(event) => {
              if (authenticated) {
                setEditingEvent(event);
                setDefaultDate('');
                setShowForm(true);
              } else {
                setEditingEvent(event);
                setShowForm(false);
                // Show view-only modal via a temporary state
              }
            }}
          />
        </div>
      )}

      {/* Event form modal (create/edit) */}
      {showForm && (
        <Modal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
          title={editingEvent ? '编辑日程' : '添加日程'}
          maxWidth="max-w-md"
        >
          <EventForm
            event={editingEvent || undefined}
            defaultDate={defaultDate}
            onSubmit={handleSave}
            onDelete={editingEvent ? () => setDeleteConfirmId(editingEvent.id) : undefined}
            loading={saving}
            deleting={deleting}
          />
        </Modal>
      )}

      {/* View-only event modal (not logged in) */}
      {!showForm && editingEvent && !authenticated && (
        <Modal
          open={true}
          onClose={() => setEditingEvent(null)}
          title={editingEvent.title}
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: editingEvent.color }}
              />
              <span className="text-stone-600 dark:text-stone-400">
                {new Date(editingEvent.event_date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </span>
            </div>
            {editingEvent.start_time && (
              <p className="text-stone-500">
                🕐 {editingEvent.start_time.slice(0, 5)}
                {editingEvent.end_time ? ` - ${editingEvent.end_time.slice(0, 5)}` : ''}
              </p>
            )}
            {editingEvent.person && (
              <p className="text-stone-500 text-xs flex items-center gap-1">👤 {editingEvent.person}</p>
            )}
            {editingEvent.reminder_minutes > 0 && (
              <p className="text-amber-500 text-xs flex items-center gap-1">🔔 已设置提醒</p>
            )}
            {editingEvent.description && (
              <p className="text-stone-600 dark:text-stone-400 mt-2 leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-3">
                {editingEvent.description}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="删除日程"
        message="确认删除这个日程吗？此操作不可撤销。"
        loading={deleting}
      />
    </div>
  );
}
