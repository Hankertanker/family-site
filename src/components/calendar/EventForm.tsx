'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Button from '@/components/ui/button';
import type { Event } from '@/types';

interface EventFormProps {
  event?: Event;
  defaultDate?: string;
  onSubmit: (data: {
    title: string;
    description: string;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    color: string;
    reminder_minutes: number;
    person: string;
  }) => void;
  onDelete?: () => void;
  loading?: boolean;
  deleting?: boolean;
}

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
];

const REMINDER_OPTIONS = [
  { value: 0, label: '不提醒' },
  { value: 5, label: '5 分钟前' },
  { value: 15, label: '15 分钟前' },
  { value: 30, label: '30 分钟前' },
  { value: 60, label: '1 小时前' },
  { value: 120, label: '2 小时前' },
  { value: 1440, label: '1 天前' },
  { value: 2880, label: '2 天前' },
  { value: 10080, label: '1 周前' },
];

const fieldBase =
  'w-full px-3.5 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-stone-400';

export default function EventForm({
  event,
  defaultDate,
  onSubmit,
  onDelete,
  loading,
  deleting,
}: EventFormProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [eventDate, setEventDate] = useState(
    event?.event_date || defaultDate || format(new Date(), 'yyyy-MM-dd')
  );
  // Helper: split time string into hour/minute for dropdowns
  function parseTime(t: string): { hour: string; minute: string } {
    if (!t || !t.includes(':')) return { hour: format(new Date(), 'HH'), minute: '00' };
    const [h, m] = t.split(':');
    return { hour: h.padStart(2, '0'), minute: (m || '00').slice(0, 2).padStart(2, '0') };
  }

  const defaultTime = parseTime(event?.start_time || format(new Date(), 'HH:mm'));
  const [startHour, setStartHour] = useState(defaultTime.hour);
  const [startMinute, setStartMinute] = useState(defaultTime.minute);
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('');

  // Build time strings for submission
  function getStartTime(): string | null {
    if (allDay) return null;
    return `${startHour}:${startMinute}`;
  }
  function getEndTime(): string | null {
    if (allDay) return null;
    if (!endHour) return null;
    return `${endHour}:${endMinute}`;
  }
  // Default: not all-day for new events, so time inputs are visible
  const [allDay, setAllDay] = useState(event ? !event?.start_time : false);
  const [color, setColor] = useState(event?.color || '#3B82F6');
  const [reminderMinutes, setReminderMinutes] = useState(
    event?.reminder_minutes ?? 0
  );
  const [person, setPerson] = useState(event?.person || '');

  // Preset family members
  const FAMILY_MEMBERS = ['', '虎仔', '爸爸', '妈妈', '爷爷', '奶奶', '全家'];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      title,
      description,
      event_date: eventDate,
      start_time: getStartTime(),
      end_time: getEndTime(),
      color,
      reminder_minutes: reminderMinutes,
      person,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          标题 *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldBase}
          placeholder="日程标题"
          required
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          日期 *
        </label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className={fieldBase}
          required
        />
      </div>

      {/* All-day toggle */}
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
          className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-stone-700 dark:text-stone-300">全天</span>
      </label>

      {/* Time inputs — minute precision */}
      {!allDay && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              开始时间
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={startHour}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setStartHour(cleaned);
                }}
                onBlur={() => {
                  if (startHour === '') setStartHour(format(new Date(), 'HH'));
                }}
                className={`${fieldBase} w-16 text-center text-lg font-semibold tabular-nums`}
                placeholder="时"
                inputMode="numeric"
              />
              <span className="text-stone-400 text-xl font-light">:</span>
              <input
                type="text"
                value={startMinute}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setStartMinute(cleaned);
                }}
                onBlur={() => {
                  if (startMinute === '') setStartMinute('00');
                }}
                className={`${fieldBase} w-16 text-center text-lg font-semibold tabular-nums`}
                placeholder="分"
                inputMode="numeric"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">填数字，例 17 点 30 分 = 下午5:30</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              结束时间
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={endHour}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setEndHour(cleaned);
                }}
                className={`${fieldBase} w-16 text-center text-lg font-semibold tabular-nums`}
                placeholder="时"
                inputMode="numeric"
              />
              <span className="text-stone-400 text-xl font-light">:</span>
              <input
                type="text"
                value={endMinute}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setEndMinute(cleaned);
                }}
                className={`${fieldBase} w-16 text-center text-lg font-semibold tabular-nums`}
                placeholder="分"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
      )}

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          颜色
        </label>
        <div className="flex gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-all ${
                c === color
                  ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-stone-900 scale-110'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Person */}
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          👤 人物
        </label>
        <div className="flex flex-wrap gap-2">
          {FAMILY_MEMBERS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPerson(m)}
              className={`px-3.5 py-1.5 text-xs rounded-xl border transition-all ${
                person === m
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-blue-300'
              }`}
            >
              {m || '不指定'}
            </button>
          ))}
        </div>
        {person && (
          <input type="hidden" name="person" value={person} />
        )}
      </div>

      {/* Reminder */}
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          ⏰ 到期提醒
        </label>
        <select
          value={reminderMinutes}
          onChange={(e) => setReminderMinutes(Number(e.target.value))}
          className={fieldBase}
        >
          {REMINDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {reminderMinutes > 0 && (
          <p className="text-[11px] text-amber-500 mt-1">
            🔔 将在日程开始前 {reminderMinutes >= 1440 ? `${Math.floor(reminderMinutes / 1440)} 天` : reminderMinutes >= 60 ? `${Math.floor(reminderMinutes / 60)} 小时` : `${reminderMinutes} 分钟`} 推送微信提醒
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          描述
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={fieldBase}
          rows={3}
          placeholder="可选描述"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button htmlType="submit" loading={loading}>
          {event ? '保存修改' : '添加日程'}
        </Button>
        {onDelete && (
          <Button htmlType="button" variant="destructive" onClick={onDelete} loading={deleting}>
            删除
          </Button>
        )}
      </div>
    </form>
  );
}
