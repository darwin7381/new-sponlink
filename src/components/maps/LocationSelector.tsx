'use client';

import React, { useState, useRef, useEffect } from 'react';
import GoogleMapsPlaces from './GoogleMapsPlaces';
import { Location } from '@/types/event';

interface LocationSelectorProps {
  location: Location;
  onChange: (location: Location) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  location,
  onChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Handle when Google Places returns location details
  const handlePlaceSelect = (placeDetails: {
    name: string;
    address: string;
    city: string;
    country: string;
    postal_code: string;
    latitude: number;
    longitude: number;
  }) => {
    // Update all location information at once
    onChange({
      ...location,
      name: placeDetails.name,
      address: placeDetails.address,
      city: placeDetails.city,
      country: placeDetails.country,
      postal_code: placeDetails.postal_code,
      latitude: placeDetails.latitude,
      longitude: placeDetails.longitude
    });
    
    // Close the panel after selection
    setIsExpanded(false);
  };
  
  // Handle using custom address
  const handleUseCustomAddress = () => {
    if (customAddress.trim()) {
      onChange({
        ...location,
        name: customAddress,
        address: customAddress,
        city: '',
        country: '',
        postal_code: '',
        latitude: undefined,
        longitude: undefined
      });
      setIsExpanded(false);
    }
  };
  
  // Calculate current location string for display
  const getDisplayAddress = () => {
    if (location.address) {
      return location.address;
    } else if (location.name) {
      return location.name;
    }
    return '';
  };
  
  // Handle location clearing
  const handleClearLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      id: "",
      name: "",
      address: "",
      city: "",
      country: "",
      postal_code: "",
      latitude: undefined,
      longitude: undefined
    });
  };
  
  // Handle click outside to close the panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);
  
  // 自動設置customAddress值從GoogleMapsPlaces組件的輸入
  useEffect(() => {
    // 初始設置為當前地址
    if (location.address) {
      setCustomAddress(location.address);
    } else if (location.name) {
      setCustomAddress(location.name);
    }
  }, [location.address, location.name]);
  
  return (
    <div className="relative w-full">
      {/* 閉合狀態 - 顯示按鈕 */}
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-start p-4 text-left bg-transparent hover:bg-accent border border-border rounded-md"
      >
        <div className="flex items-center w-full">
          <div className="flex-shrink-0 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="10" r="3" />
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
            </svg>
          </div>
          <div className="flex-1">
            {getDisplayAddress() ? (
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{getDisplayAddress()}</span>
                <button 
                  onClick={handleClearLocation}
                  className="ml-2 text-muted-foreground hover:text-destructive"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ) : (
              <div>
                <div className="font-medium">Add Event Location</div>
                <div className="text-sm text-muted-foreground">Offline location or virtual link</div>
              </div>
            )}
          </div>
        </div>
      </button>
      
      {/* 展開面板 */}
      {isExpanded && (
        <div 
          ref={panelRef} 
          className="absolute z-50 mt-1 w-full bg-background border border-border shadow-lg rounded-md overflow-hidden"
        >
          {/* Google Places 搜索框 */}
          <div className="p-3 border-b border-border">
            <GoogleMapsPlaces 
              onPlaceSelect={handlePlaceSelect}
              placeholder="Enter location or virtual link"
              defaultValue={customAddress}
              onInputChange={setCustomAddress}
              className="mb-0"
            />
          </div>
          
          {/* 最近位置 */}
          <div className="p-3 border-b border-border">
            <div className="text-sm font-medium mb-2">Recent Locations</div>
            <div className="text-sm text-muted-foreground">No recently used locations.</div>
          </div>
          
          {/* 虛擬選項 */}
          <div className="p-3 border-b border-border">
            <div className="text-sm font-medium mb-2">Virtual Options</div>
            <div className="space-y-2">
              <button 
                type="button"
                className="w-full flex items-center p-2 hover:bg-accent rounded-md text-sm"
              >
                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z"></path>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                Create Zoom meeting
              </button>
              <button 
                type="button"
                className="w-full flex items-center p-2 hover:bg-accent rounded-md text-sm"
              >
                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z"></path>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                Select existing Zoom
              </button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              If you have a virtual event link, you can enter or paste it above.
            </div>
          </div>
          
          {/* 自定義地址選項 */}
          {customAddress.trim() && (
            <div className="p-3">
              <button 
                type="button"
                onClick={handleUseCustomAddress}
                className="w-full flex items-center p-2 hover:bg-accent rounded-md text-sm"
              >
                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12"></path>
                </svg>
                Use &quot;{customAddress}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector; 