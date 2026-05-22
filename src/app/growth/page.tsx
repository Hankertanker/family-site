'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, DatePicker, InputNumber, message, Empty, Skeleton, Modal } from 'antd';
import { DeleteOutlined, PlusOutlined, SmileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { GrowthRecord } from '@/types';

export default function GrowthPage() {
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [recordDate, setRecordDate] = useState<dayjs.Dayjs>(dayjs());
  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [milestone, setMilestone] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/growth');
      const data = await res.json();
      setRecords(data.records);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    if (!recordDate) {
      message.warning('请选择日期');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record_date: recordDate.format('YYYY-MM-DD'),
          height,
          weight,
          milestone: milestone.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setHeight(null);
        setWeight(null);
        setMilestone('');
        setNotes('');
        message.success('已记录');
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
      await fetch(`/api/growth/${id}`, { method: 'DELETE' });
      message.success('已删除');
      load();
    } catch {
      message.error('删除失败');
    }
  }

  function formatDate(dateStr: string) {
    return dayjs(dateStr).format('YYYY年M月D日');
  }

  function calcAge(dateStr: string): string {
    // Calculate age from birth (assuming records start from birth)
    // Just show relative days from record
    const d = dayjs(dateStr);
    const now = dayjs();
    const months = now.diff(d, 'month');
    if (months < 24) return `${months}个月`;
    const years = Math.floor(months / 12);
    const remainMonths = months % 12;
    return remainMonths > 0 ? `${years}岁${remainMonths}个月` : `${years}岁`;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <SmileOutlined /> 虎仔成长记录
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">记录宝贝的每一步成长 🌱</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          记录
        </Button>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : records.length === 0 ? (
        <Empty description="还没有成长记录" className="py-12" />
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <Card
              key={r.id}
              className="bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 shadow-sm"
              size="small"
              styles={{ body: { padding: '16px' } }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                      {formatDate(r.record_date)}
                    </span>
                    <span className="text-xs text-stone-400">
                      ({calcAge(r.record_date)})
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {r.height != null && (
                      <span className="text-stone-600 dark:text-stone-400">
                        📏 {r.height} cm
                      </span>
                    )}
                    {r.weight != null && (
                      <span className="text-stone-600 dark:text-stone-400">
                        ⚖️ {r.weight} kg
                      </span>
                    )}
                  </div>
                  {r.milestone && (
                    <div className="mt-2">
                      <span className="inline-block bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 text-xs px-2 py-0.5 rounded-full">
                        🎯 {r.milestone}
                      </span>
                    </div>
                  )}
                  {r.notes && (
                    <p className="text-xs text-stone-500 mt-2">{r.notes}</p>
                  )}
                </div>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(r.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        title="记录成长数据"
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => {
          setModalOpen(false);
          setHeight(null);
          setWeight(null);
          setMilestone('');
          setNotes('');
        }}
        confirmLoading={submitting}
        okText="保存"
        cancelText="取消"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm text-stone-500 block mb-1">日期</label>
            <DatePicker
              className="w-full"
              value={recordDate}
              onChange={(d) => d && setRecordDate(d)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-stone-500 block mb-1">身高 (cm)</label>
              <InputNumber
                className="w-full"
                min={0}
                step={0.5}
                value={height}
                onChange={(v) => setHeight(v)}
                placeholder="可选"
              />
            </div>
            <div>
              <label className="text-sm text-stone-500 block mb-1">体重 (kg)</label>
              <InputNumber
                className="w-full"
                min={0}
                step={0.1}
                value={weight}
                onChange={(v) => setWeight(v)}
                placeholder="可选"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-stone-500 block mb-1">里程碑事件</label>
            <Input
              placeholder="如：第一次翻身、会叫妈妈了"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-stone-500 block mb-1">备注</label>
            <Input.TextArea
              rows={2}
              placeholder="其他想记录的内容"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
