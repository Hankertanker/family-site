'use client';

import { useState, useEffect, useCallback } from 'react';
import { List, Button, Input, DatePicker, Checkbox, message, Empty, Skeleton, Tag, Modal, Select } from 'antd';
import { DeleteOutlined, PlusOutlined, ScheduleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Chore } from '@/types';

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDueDate, setNewDueDate] = useState<dayjs.Dayjs | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/chores');
      const data = await res.json();
      setChores(data.chores);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(item: Chore) {
    try {
      const res = await fetch(`/api/chores/${item.id}`, {
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
    if (!newTitle.trim()) {
      message.warning('请输入任务标题');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/chores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          assignee: newAssignee,
          due_date: newDueDate ? newDueDate.format('YYYY-MM-DD') : null,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setNewTitle('');
        setNewAssignee('');
        setNewDueDate(null);
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
      await fetch(`/api/chores/${id}`, { method: 'DELETE' });
      message.success('已删除');
      load();
    } catch {
      message.error('删除失败');
    }
  }

  function isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    return dayjs(dueDate).isBefore(dayjs(), 'day') && !chores.find((c) => c.due_date === dueDate)?.done;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <ScheduleOutlined /> 任务 / 值班表
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">家务分工，井井有条 🧹</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          新建任务
        </Button>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : chores.length === 0 ? (
        <Empty description="还没有任务" className="py-12" />
      ) : (
        <List
          className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm"
          dataSource={chores}
          renderItem={(item) => {
            const overdue = !item.done && item.due_date && dayjs(item.due_date).isBefore(dayjs(), 'day');
            return (
              <List.Item
                className={`px-4 py-3 ${item.done ? 'opacity-60' : ''}`}
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
                        : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {item.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {item.assignee && (
                      <Tag className="text-xs">{item.assignee}</Tag>
                    )}
                    {item.due_date && (
                      <span
                        className={`text-xs ${
                          overdue ? 'text-red-500' : 'text-stone-400'
                        }`}
                      >
                        📅 {dayjs(item.due_date).format('M/D')}
                        {overdue && ' ⚠️'}
                      </span>
                    )}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      )}

      <Modal
        title="新建任务"
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => {
          setModalOpen(false);
          setNewTitle('');
          setNewAssignee('');
          setNewDueDate(null);
        }}
        confirmLoading={submitting}
        okText="添加"
        cancelText="取消"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm text-stone-500 block mb-1">任务标题</label>
            <Input
              placeholder="如：洗碗、拖地"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-stone-500 block mb-1">负责人</label>
            <Input
              placeholder="谁来做？"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-stone-500 block mb-1">截止日期</label>
            <DatePicker
              className="w-full"
              value={newDueDate}
              onChange={(d) => setNewDueDate(d)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
