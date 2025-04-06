'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadDropzoneProps {
  onUploadComplete?: (imageUrl: string) => void;
  className?: string;
  dropzoneText?: string;
  buttonText?: string;
  acceptTypes?: string;
  maxSizeMB?: number;
  showPreview?: boolean;
  initialImage?: string;
}

export function ImageUploadDropzone({
  onUploadComplete,
  className = '',
  dropzoneText = '拖放圖片到此處上傳',
  buttonText = '或點擊選擇圖片',
  acceptTypes = 'image/jpeg,image/png,image/gif,image/webp',
  maxSizeMB = 5,
  showPreview = true,
  initialImage = ''
}: ImageUploadDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImage) {
      setPreviewUrl(initialImage);
    }
  }, [initialImage]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    // 檢查文件類型
    const fileTypes = acceptTypes.split(',');
    if (!fileTypes.includes(file.type)) {
      toast.error('不支持的文件類型');
      return false;
    }

    // 檢查文件大小
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`文件過大，最大支持 ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const generatePreview = (file: File) => {
    if (showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;
    
    generatePreview(file);

    try {
      setIsUploading(true);
      setProgress(10);

      // 創建 FormData
      const formData = new FormData();
      formData.append('file', file);

      // 模擬上傳進度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 85 ? newProgress : prev;
        });
      }, 200);

      // 上傳文件
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
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
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setProgress(0);
      // 重置文件輸入框
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      uploadFile(file);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    uploadFile(file);
  };

  return (
    <div className={`${className} relative`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptTypes}
        className="hidden"
        aria-label="圖片上傳"
      />
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center relative h-64 flex flex-col items-center justify-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } transition-colors duration-200 cursor-pointer overflow-hidden`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {/* 背景圖層 - 只在有圖片時顯示 */}
        {showPreview && previewUrl && !isUploading && (
          <>
            <img 
              src={previewUrl} 
              alt="背景預覽" 
              className="absolute inset-0 w-full h-full object-cover z-0" 
            />
            <div className="absolute inset-0 bg-black/20 z-[1]"></div>
          </>
        )}
        
        {/* 文字提示區域 */}
        <div className={`z-[2] relative ${showPreview && previewUrl && !isUploading ? 'text-white' : 'text-gray-500'}`}>
          {isUploading ? (
            <p>正在上傳...{progress}%</p>
          ) : (
            <>
              <p className="mb-2">{dropzoneText}</p>
              <Button 
                variant={showPreview && previewUrl ? "secondary" : "outline"} 
                disabled={isUploading}
                className={showPreview && previewUrl ? "bg-white/30 hover:bg-white/40 border-white text-white" : ""}
              >
                {buttonText}
              </Button>
            </>
          )}
        </div>
        
        {/* 進度條 */}
        {isUploading && (
          <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden z-[2] relative">
            <div
              className="h-full bg-green-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
} 