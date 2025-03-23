"use client";

import { useState } from 'react';
import { Location, LocationType } from '@/types/event';
import { formatLocation } from '@/utils/languageUtils';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface LocationDisplayProps {
  location: Location;
  showDetails?: boolean;
  className?: string;
}

export default function LocationDisplay({ location, showDetails = false, className = '' }: LocationDisplayProps) {
  const [copied, setCopied] = useState(false);
  
  if (!location || !location.location_type) {
    return <div className={className}>地點待定</div>;
  }
  
  // 處理虛擬地點
  if (location.location_type === LocationType.VIRTUAL) {
    const displayName = location.name || 'Virtual Event';
    const address = location.address || '';
    
    // 判斷是否為有效鏈接
    const isValidUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return false;
      }
    };
    
    // 處理鏈接顯示
    const linkAddress = isValidUrl(address) ? address : isValidUrl(`https://${address}`) ? `https://${address}` : null;
    
    // 複製鏈接地址
    const copyToClipboard = () => {
      if (linkAddress) {
        navigator.clipboard.writeText(linkAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };
    
    return (
      <div className={`${className} flex flex-col`}>
        <div className="flex items-center">
          <span className="inline-flex items-center bg-primary/10 text-primary text-xs px-2 py-1 rounded-full mr-2">
            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            虛擬活動
          </span>
          <span>{displayName}</span>
        </div>
        
        {showDetails && linkAddress && (
          <div className="mt-2 flex items-center">
            <code className="bg-muted px-2 py-1 rounded text-sm mr-2 truncate max-w-xs">
              {address}
            </code>
            <div className="flex">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}
                title={copied ? '已複製!' : '複製連結'}>
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              
              {linkAddress && (
                <a href={linkAddress} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="開啟連結">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // 處理實體地點
  const formattedLocationText = formatLocation(location.city, location.country);
  const displayAddress = location.address || location.full_address || '';
  
  return (
    <div className={`${className} flex flex-col`}>
      <div>
        {location.name && <span className="font-medium">{location.name}</span>}
        {location.name && formattedLocationText && <span className="mx-1">•</span>}
        {formattedLocationText && <span>{formattedLocationText}</span>}
      </div>
      
      {showDetails && displayAddress && (
        <div className="mt-1 text-sm text-muted-foreground">
          {displayAddress}
        </div>
      )}
    </div>
  );
} 