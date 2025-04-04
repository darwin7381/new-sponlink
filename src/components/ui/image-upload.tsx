'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUploadComplete?: (imageUrl: string) => void;
  className?: string;
  buttonText?: string;
  acceptTypes?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  onUploadComplete,
  className = '',
  buttonText = '上傳圖片',
  acceptTypes = 'image/jpeg,image/png,image/gif,image/webp',
  maxSizeMB = 5
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查文件類型
    const fileTypes = acceptTypes.split(',');
    if (!fileTypes.includes(file.type)) {
      toast.error('不支持的文件類型');
      return;
    }

    // 檢查文件大小
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`文件過大，最大支持 ${maxSizeMB}MB`);
      return;
    }

    try {
      setIsUploading(true);
      setProgress(10);

      // 創建 FormData
      const formData = new FormData();
      formData.append('file', file);

      // 上傳文件
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setProgress(90);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '上傳失敗');
      }

      const result = await response.json();
      setProgress(100);

      if (result.url) {
        toast.success('上傳成功');
        onUploadComplete?.(result.url);
      } else {
        throw new Error('上傳失敗，未獲取到圖片URL');
      }
    } catch (error) {
      toast.error((error as Error).message || '上傳失敗');
    } finally {
      setIsUploading(false);
      setProgress(0);
      // 重置文件輸入框
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptTypes}
        className="hidden"
        aria-label="圖片上傳"
      />
      <Button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="relative overflow-hidden"
      >
        {isUploading ? '正在上傳...' : buttonText}
        {isUploading && progress > 0 && (
          <div
            className="absolute left-0 bottom-0 h-1 bg-green-500"
            style={{ width: `${progress}%` }}
          ></div>
        )}
      </Button>
    </div>
  );
} 