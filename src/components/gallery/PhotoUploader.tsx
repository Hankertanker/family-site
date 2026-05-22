'use client';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

import { useState, useRef } from 'react';
import Button from '@/components/ui/button';

interface PhotoUploaderProps {
  albumId: number;
  onUploaded: () => void;
}

export default function PhotoUploader({ albumId, onUploaded }: PhotoUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('album_id', String(albumId));
    files.forEach((f) => formData.append('files', f));

    const res = await fetchWithAuth('/api/photos', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (res.ok) {
      setFiles([]);
      onUploaded();
    }
    setUploading(false);
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
          dragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/30'
            : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const dropped = Array.from(e.dataTransfer.files);
          setFiles((prev) => [...prev, ...dropped]);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <svg
          className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          点击或拖拽上传照片
        </p>
        <p className="text-xs text-stone-400 mt-1">
          支持 JPG、PNG、WebP，单张最大 5MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleSelect}
        />
      </div>

      {files.length > 0 && (
        <div>
          <p className="text-sm text-stone-500 mb-2">已选择 {files.length} 张照片</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((f, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <img
                  src={URL.createObjectURL(f)}
                  alt={f.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <Button onClick={handleUpload} loading={uploading}>
            上传 {files.length} 张照片
          </Button>
        </div>
      )}
    </div>
  );
}
