'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  fallbackSrc?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 80,
  sizes = '100vw',
  loading = 'lazy',
  placeholder = 'empty',
  format = 'webp',
  fallbackSrc,
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 重置狀態
    setError(false);
    
    // 如果是完整 URL，則處理為使用我們的圖片 API
    if (src.startsWith('http')) {
      // 從 URL 獲取檔案名
      const urlParts = src.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // 檢查是否是來自我們的 R2 存儲
      const customDomain = process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN;
      if (customDomain && src.includes(customDomain)) {
        // 為我們的圖片 API 構建 URL
        let apiUrl = `/api/image/${fileName}`;
        const params = new URLSearchParams();
        
        if (width) params.append('width', width.toString());
        if (height) params.append('height', height.toString());
        if (quality) params.append('quality', quality.toString());
        if (format) params.append('format', format);
        
        const queryString = params.toString();
        if (queryString) {
          apiUrl += `?${queryString}`;
        }
        
        setImgSrc(apiUrl);
      } else {
        // 不是我們的 R2 存儲，使用原始 URL
        setImgSrc(src);
      }
    } else {
      // 已經是相對路徑，不需要處理
      setImgSrc(src);
    }
  }, [src, width, height, quality, format]);

  // 處理圖片載入失敗
  const handleError = () => {
    setError(true);
    if (fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  // 生成尺寸相關的類名
  const dimensionClasses = cn({
    'w-full': !width,
    'h-full': !height,
    [`w-[${width}px]`]: !!width,
    [`h-[${height}px]`]: !!height,
  });

  // 生成對象適應的類名
  const objectFitClass = cn({
    'object-cover': objectFit === 'cover',
    'object-contain': objectFit === 'contain',
    'object-fill': objectFit === 'fill',
    'object-none': objectFit === 'none',
    'object-scale-down': objectFit === 'scale-down',
  });

  // 如果還沒有準備好 imgSrc，顯示一個佔位元素
  if (!imgSrc) {
    return (
      <div 
        className={cn(
          'bg-gray-200 animate-pulse',
          dimensionClasses,
          className
        )}
        aria-label={alt}
      />
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={imgSrc}
        alt={alt}
        width={width || 0}
        height={height || 0}
        priority={priority}
        quality={quality}
        sizes={sizes}
        loading={loading}
        placeholder={placeholder}
        onError={handleError}
        className={cn(objectFitClass, dimensionClasses)}
        unoptimized={false} // 讓 Next.js 也進行優化
      />
      
      {error && !fallbackSrc && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400"
          aria-label={`無法載入圖片: ${alt}`}
        >
          <span className="text-sm">圖片無法載入</span>
        </div>
      )}
    </div>
  );
} 