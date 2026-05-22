'use client';

import { useState, useEffect, useCallback } from 'react';
import { List, Button, Input, DatePicker, Checkbox, message, Empty, Skeleton, Tag, Modal, Select } from 'antd';
import { DeleteOutlined, PlusOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { HealthReminder } from '@/types';

export default function HealthPage() {
  const [reminders, setReminders] = useState<HealthReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState<dayjs.Dayjs | null>(null);
  const [newPerson, setNewPerson] = useState('虎仔');
  const [newReminderMinutes, setNewReminderMinutes] = useState(1440);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setReminders(data.reminders);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(item: HealthReminder) {
    try {
      const res = await fetch(`/api/health/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: item.done ? 0 : 1 }),
      });
      if (res.ok) load();
    } catch {
      message.error('操作失败');
    }
  }

  async function handleAdd() {
    if (!newTitle.trim() || !newDate) {
      message.warning('请填写标题和日期');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          reminder_date: newDate.format('YYYY-MM-DD'),
          person: newPerson,
          reminder_minutes: newReminderMinutes,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewDate(null);
        setNewPerson('虎仔');
        setNewReminderMinutes(1440);
        message.success('已添加');
        load();
      } else {
        const err = await res.json();
        message.error(err.error || '添加失败');
      }
    } catch {
      message.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/health/${id}`, { method: 'DELETE' });
      message.success('已删除');
      load();
    } catch {
      message.error('删除失败');
    }
  }

  function isExpired(dateStr: string): boolean {
    return dayjs(dateStr).isBefore(dayjs(), 'day');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <MedicineBoxOutlined /> 健康提醒
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">疫苗、体检，一个都不忘 💉</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          添加提醒
        </Button>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : reminders.length === 0 ? (
        <Empty description="还没有健康提醒" className="py-12" />
      ) : (
        <List
          className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm"
          dataSource={reminders}
          renderItem={(item) => {
            const expired = !item.done && isExpired(item.reminder_date);
            return (
              <List.Item
                className={`px-4 py-3 ${item.done ? 'opacity-60' : ''} ${
                  expired ? 'border-l-4 border-l-red-400' : ''
                }`}
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(item.id)}
                  />,
                ]}
              >
                <Checkbox
                  checked={!!item.done}
                  onChange={() => handleToggle(item)}
                />
                <div className="flex-1 min-w-0 ml-2">
                  <span
                    className={`text-sm ${
                      item.done
                        ? 'line-through text-stone-400'
                        : expired
                        ? 'text-red-600 dark:text-red-400 font-medium'
                        : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.description && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="text-xs">{item.person}</Tag>
                    <span
                      className={`text-xs ${
                        expired ? 'text-red-500 font-medium' : 'text-stone-400'
                      }`}
                    >
                      📅 {dayjs(item.reminder_date).format('YYYY-M-D')}
                      {expired && ' （已过期）'}
                    </span>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      )}

      <Modal
        title="添加健康提醒"
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => {
          setModalOpen(false);
          setNewTitle('');
          setNewDescription('');
          setNewDate(null);
          setNewPerson('虎仔');
          setNewReminderMinutes(1440);
        }}
        confirmLoading={submitting}
        okText="添加"
        cancelText="取消"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm text-stone-500 block mb-1">标题</label>
            <Input
              placeholder="如：乙肝疫苗第二针"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-stone-500 block mb-1">描述</label>
            <Input.TextArea
              rows={2}
              placeholder="可选说明"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-stone-500 block mb-1">提醒日期</label>
            <DatePicker
              className="w-full"
              value={newDate}
              onChange={(d) => setNewDate(d)}
            />
          </div>
          <div>
            <label className="text-sm text-stone-500 block mb-1">相关人员</label>
            <Select
              className="w-full"
              value={newPerson}
              onChange={(v) => setNewPerson(v)}
              options={[
                { value: '虎仔', label: '虎仔' },
                { value: '妈妈', label: '妈妈' },
                { value: '爸爸', label: '爸爸' },
                { value: '全家', label: '全家' },
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
