'use client';

import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}: ConfirmDialogProps) {
  const calledRef = useRef(false);

  useEffect(() => {
    if (!open) {
      calledRef.current = false;
      return;
    }
    if (calledRef.current) return;
    calledRef.current = true;

    Modal.confirm({
      title,
      icon: <ExclamationCircleOutlined />,
      content: message,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true, loading },
      centered: true,
      onOk: () => {
        onConfirm();
        return new Promise((resolve) => {
          // Let the parent handle closing
          setTimeout(resolve, 100);
        });
      },
      onCancel: onClose,
      afterClose: onClose,
    });
  }, [open, title, message, onConfirm, onClose, loading]);

  return null;
}
