'use client';

import { useState, useEffect, useCallback } from 'react';
import { List, Button, Input, message, Empty, Skeleton, Tag } from 'antd';
import { DeleteOutlined, SendOutlined, MessageOutlined } from '@ant-design/icons';
import type { BoardMessage } from '@/types';

export default function BoardPage() {
  const [messages, setMessages] = useState<BoardMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/board');
      const data = await res.json();
      setMessages(data.messages);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  async function handleSend() {
    if (!content.trim()) {
      message.warning('请输入留言内容');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          author: author.trim() || '匿名',
        }),
      });
      if (res.ok) {
        setContent('');
        message.success('留言已发送');
        loadMessages();
      } else {
        const err = await res.json();
        message.error(err.error || '发送失败');
      }
    } catch {
      message.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/board/${id}`, { method: 'DELETE' });
      message.success('已删除');
      loadMessages();
    } catch {
      message.error('删除失败');
    }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
          <MessageOutlined /> 家庭留言板
        </h1>
        <p className="text-sm text-stone-400 mt-0.5">有什么想对家人说的？💬</p>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : messages.length === 0 ? (
        <Empty description="还没有留言，说点什么吧" className="py-12" />
      ) : (
        <List
          className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden shadow-sm"
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item
              className="px-4 py-4"
              actions={[
                <Button
                  key="delete"
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(msg.id)}
                />,
              ]}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-stone-400">
                  <Tag className="text-xs">{msg.author || '匿名'}</Tag>
                  <span>{formatTime(msg.created_at)}</span>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}

      <div className="mt-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-4 shadow-sm">
        <Input.TextArea
          placeholder="写下想说的话…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={500}
          showCount
        />
        <div className="flex items-center gap-2 mt-3">
          <Input
            placeholder="你的名字（可选）"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-36"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={submitting}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}
