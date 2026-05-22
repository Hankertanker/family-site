'use client';

import { Modal as AntModal, ConfigProvider } from 'antd';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 12,
          colorPrimary: '#3b82f6',
        },
      }}
    >
      <AntModal
        open={open}
        onCancel={onClose}
        footer={null}
        title={title || undefined}
        width={
          maxWidth === 'max-w-sm'
            ? 384
            : maxWidth === 'max-w-md'
            ? 480
            : maxWidth === 'max-w-lg'
            ? 560
            : 560
        }
        centered
        destroyOnClose
      >
        {children}
      </AntModal>
    </ConfigProvider>
  );
}
