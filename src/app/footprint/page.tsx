'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Tag, message, Empty } from 'antd';
import { PlusOutlined, EnvironmentOutlined, DeleteOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false });
import dayjs from 'dayjs';

// Dynamic import for Leaflet (no SSR)
const MapContainer = dynamic(() => import('./MapView'), { ssr: false });

interface Footprint {
  id: number;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  visit_date: string | null;
  color: string;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function FootprintPage() {
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPos, setSelectedPos] = useState<{lat:number;lng:number;name:string} | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/footprints')
      .then(r => r.json())
      .then(data => { setFootprints(data.footprints || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!selectedPos) { message.error('请先选择地点'); return; }
    const values = await form.validateFields();
    setSaving(true);
    const res = await fetch('/api/footprints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        latitude: selectedPos.lat,
        longitude: selectedPos.lng,
        visit_date: values.visit_date ? values.visit_date.format('YYYY-MM-DD') : null,
      }),
    });
    if (res.ok) {
      message.success('已添加');
      setShowForm(false);
      form.resetFields();
      load();
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/footprints/${id}`, { method: 'DELETE' });
    message.success('已删除');
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">🗺️ 足迹地图</h1>
          <p className="text-sm text-stone-400 mt-0.5">我们去过的地方</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
          添加足迹
        </Button>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden mb-6" style={{ height: 400 }}>
        <MapContainer footprints={footprints} />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {footprints.map(fp => (
          <Card
            key={fp.id}
            size="small"
            className="hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fp.color }} />
                  <span className="font-medium text-sm">{fp.title}</span>
                </div>
                {fp.description && <p className="text-xs text-stone-400 mt-1">{fp.description}</p>}
                {fp.visit_date && (
                  <p className="text-xs text-stone-300 mt-1">
                    <EnvironmentOutlined className="mr-0.5" />{fp.visit_date}
                  </p>
                )}
              </div>
              <button onClick={() => handleDelete(fp.id)} className="text-stone-300 hover:text-red-500 p-1">
                <DeleteOutlined />
              </button>
            </div>
          </Card>
        ))}
        {!loading && footprints.length === 0 && <Empty className="col-span-full py-12" description="还没有足迹，添加一个吧" />}
      </div>

      <Modal open={showForm} onCancel={() => setShowForm(false)} onOk={handleSubmit} okText="添加" confirmLoading={saving} title="添加足迹">
        <Form form={form} layout="vertical" initialValues={{ color: '#3B82F6' }}>
          <MapPicker onLocationSelect={(lat, lng, name) => {
            setSelectedPos({lat,lng,name});
            form.setFieldValue('title', name.split(',')[0] || name);
          }} />
          <Form.Item name="title" label="地点名称" rules={[{ required: true }]}>
            <Input placeholder="如：西安城墙" />
          </Form.Item>
          <Form.Item label="地点" required>
            <div id="map-picker-placeholder" />
          </Form.Item>
          <Form.Item name="visit_date" label="游玩日期">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <div className="flex gap-2">
              {COLORS.map(c => (
                <div key={c} className="w-7 h-7 rounded-full cursor-pointer border-2 border-transparent hover:scale-110 transition"
                  style={{ backgroundColor: c }}
                  onClick={() => form.setFieldValue('color', c)} />
              ))}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
