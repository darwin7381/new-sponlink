'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Location } from '@/types/event';

// 定義推薦位置結構
interface Prediction {
  id: string;
  name: string;
  address: string;
  mainText?: string;
  secondaryText?: string;
}

// 定義Places API響應結構
interface PlaceApiPlace {
  id: string;
  displayName?: {
    text: string;
    languageCode: string;
  };
  formattedAddress?: string;
}

interface AddressComponent {
  types: string[];
  longText: string;
}

interface LocationSelectorProps {
  location: Location;
  onChange: (location: Location) => void;
}

// 虛擬會議平台匹配規則
const VIRTUAL_PLATFORMS = [
  { name: 'Zoom', regex: /zoom\.us|zoomus\.cn/i },
  { name: 'Google Meet', regex: /meet\.google\.com/i },
  { name: 'Microsoft Teams', regex: /teams\.microsoft\.com|teams\.live\.com/i },
  { name: 'Webex', regex: /webex\.com/i },
  { name: 'Skype', regex: /skype\.com/i },
  { name: 'Discord', regex: /discord\.com|discord\.gg/i },
  { name: 'Slack', regex: /slack\.com/i },
]

// 檢測URL是否為虛擬會議連結
const detectVirtualPlatform = (url: string): { isVirtual: boolean, platformName: string } => {
  // 如果輸入非常短或明顯不是URL，直接返回非虛擬
  if (!url || url.length < 4 || !url.includes('.')) {
    return { isVirtual: false, platformName: '' };
  }

  // 避免將純地址或位置名稱誤識別為虛擬連結
  // 地址內容通常包含數字、逗號、空格等，而非純URL
  const addressPattern = /\d+.*?(st|rd|ave|blvd|square|plaza|district|road|street|avenue)/i;
  if (addressPattern.test(url)) {
    return { isVirtual: false, platformName: '' };
  }

  // 嘗試添加協議前綴以正確解析URL
  let normalizedUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    normalizedUrl = `https://${url}`;
  }

  try {
    const urlObj = new URL(normalizedUrl);
    const hostname = urlObj.hostname;
    
    // 不要將明顯是搜索詞的內容識別為URL
    // 例如： "café in paris" 不應該被視為URL，即使它包含點
    if (hostname.includes(' ') || !hostname.includes('.')) {
      return { isVirtual: false, platformName: '' };
    }
    
    // 檢查是否匹配已知的虛擬平台
    for (const platform of VIRTUAL_PLATFORMS) {
      if (platform.regex.test(hostname)) {
        return { isVirtual: true, platformName: platform.name };
      }
    }
    
    // 檢查是否為有效URL但非已知會議平台
    return { isVirtual: true, platformName: 'Virtual' };
  } catch {
    // 解析URL失敗，可能不是有效的URL
    return { isVirtual: false, platformName: '' };
  }
};

const LocationSelector: React.FC<LocationSelectorProps> = ({
  location,
  onChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isVirtual, setIsVirtual] = useState(false);
  const [platformName, setPlatformName] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  // 處理當Google Places返回位置詳情
  const handlePlaceSelect = (placeDetails: {
    name: string;
    address: string;
    city: string;
    country: string;
    postal_code: string;
    latitude: number;
    longitude: number;
    place_id?: string;
  }) => {
    // 一次性更新所有位置信息
    onChange({
      ...location,
      name: placeDetails.name,
      address: placeDetails.address,
      city: placeDetails.city,
      country: placeDetails.country,
      postal_code: placeDetails.postal_code,
      latitude: placeDetails.latitude,
      longitude: placeDetails.longitude,
      isVirtual: false,
      platformName: '',
      place_id: placeDetails.place_id
    });
    
    // 選擇後關閉面板
    setIsExpanded(false);
    setIsVirtual(false);
    setPlatformName('');
  };
  
  // 處理使用自定義地址或虛擬連結
  const handleUseCustomAddress = () => {
    if (inputValue.trim()) {
      // 檢測是否為虛擬會議連結
      const { isVirtual, platformName } = detectVirtualPlatform(inputValue);
      
      onChange({
        ...location,
        name: isVirtual ? (platformName !== 'Virtual' ? platformName : '') : inputValue,
        address: inputValue,
        city: '',
        country: '',
        postal_code: '',
        latitude: undefined,
        longitude: undefined,
        isVirtual: isVirtual,
        platformName: isVirtual ? platformName : '',
        place_id: undefined // 自定義地址或虛擬連結不使用 place_id
      });
      
      setIsVirtual(isVirtual);
      setPlatformName(platformName);
      setIsExpanded(false);
    }
  };
  
  // 計算當前位置字符串顯示
  const getDisplayAddress = () => {
    if (location.address) {
      return location.address;
    } else if (location.name) {
      return location.name;
    }
    return '';
  };
  
  // 處理位置清除
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
      longitude: undefined,
      isVirtual: false,
      platformName: '',
      place_id: undefined
    });
    setIsVirtual(false);
    setPlatformName('');
  };
  
  // 切換展開狀態
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };
  
  // 處理點擊外部關閉面板
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current && 
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
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
  
  // 自動設置inputValue值並檢測虛擬連結狀態
  useEffect(() => {
    // 初始設置為當前地址
    if (location.address) {
      setInputValue(location.address);
      
      // 檢測是否為虛擬會議連結
      const { isVirtual, platformName } = detectVirtualPlatform(location.address);
      setIsVirtual(location.isVirtual || isVirtual);
      setPlatformName(location.platformName || platformName);
    } else if (location.name) {
      setInputValue(location.name);
      setIsVirtual(!!location.isVirtual);
      setPlatformName(location.platformName || '');
    }
  }, [location.address, location.name, location.isVirtual, location.platformName]);
  
  // 處理輸入變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // 檢測是否為虛擬會議連結
    // 注意：這裡只是檢測但不做任何處理，所以不需要存儲結果
    detectVirtualPlatform(value);
    
    // 如果輸入為空，就不顯示預測
    if (!value.trim()) {
      setPredictions([]);
      return;
    }
    
    // 即使是虛擬連結，也嘗試獲取地點預測，確保選項一致性
    fetchPredictions(value);
  };
  
  // 獲取地點預測
  const fetchPredictions = async (input: string) => {
    if (!input.trim()) return;
    
    try {
      // 使用新版Places API進行全球搜索(無地區限制)
      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
        },
        body: JSON.stringify({
          textQuery: input,
          languageCode: 'en'
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.places && data.places.length > 0) {
        // 轉換為我們的預測格式，並限制最多5個結果
        const transformedPredictions = data.places
          .map((place: PlaceApiPlace) => ({
            id: place.id,
            name: place.displayName?.text || '',
            address: place.formattedAddress || '',
            mainText: place.displayName?.text || '',
            secondaryText: place.formattedAddress || ''
          }))
          .slice(0, 5); // 限制最多5個預測結果
        
        setPredictions(transformedPredictions);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('預測請求錯誤:', error);
      setPredictions([]);
    }
  };
  
  // 處理預測選擇
  const handlePredictionSelect = async (prediction: Prediction) => {
    setInputValue(prediction.address || prediction.name || '');
    
    try {
      // 獲取地點詳細信息
      const response = await fetch(`https://places.googleapis.com/v1/places/${prediction.id}`, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'displayName,formattedAddress,location,addressComponents'
        }
      });
      
      const placeData = await response.json();
      
      if (response.ok && placeData) {
        // 提取地址組件
        let city = '';
        let country = '';
        let postal_code = '';
        
        if (placeData.addressComponents) {
          placeData.addressComponents.forEach((component: AddressComponent) => {
            if (component.types.includes('locality')) {
              city = component.longText || '';
            } else if (component.types.includes('country')) {
              country = component.longText || '';
            } else if (component.types.includes('postal_code')) {
              postal_code = component.longText || '';
            } else if (component.types.includes('administrative_area_level_1') && !city) {
              city = component.longText || '';
            }
          });
        }
        
        // 構建地點詳情
        handlePlaceSelect({
          name: placeData.displayName?.text || prediction.name || '',
          address: placeData.formattedAddress || prediction.address || '',
          city,
          country,
          postal_code,
          latitude: placeData.location?.latitude || 0,
          longitude: placeData.location?.longitude || 0,
          place_id: prediction.id
        });
      } else {
        // 即使無法獲取完整詳情，也提供基本信息
        handlePlaceSelect({
          name: prediction.name || '',
          address: prediction.address || '',
          city: '',
          country: '',
          postal_code: '',
          latitude: 0,
          longitude: 0,
          place_id: prediction.id
        });
      }
    } catch (error) {
      console.error('獲取地點詳情錯誤:', error);
      
      // 回退使用基本信息
      handlePlaceSelect({
        name: prediction.name || '',
        address: prediction.address || '',
        city: '',
        country: '',
        postal_code: '',
        latitude: 0,
        longitude: 0,
        place_id: prediction.id
      });
    }
  };
  
  return (
    <div className="relative w-full">
      {/* 主按鈕 - 點擊後展開面板 */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleExpanded}
        className="w-full flex items-center justify-start p-4 text-left border border-neutral-700 rounded-md bg-black text-white"
      >
        <div className="flex items-center w-full">
          <div className="flex-shrink-0 mr-3 text-white">
            {isVirtual ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="10" r="3" />
                <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            {getDisplayAddress() ? (
              <div className="flex items-center justify-between w-full">
                <div className="text-white">
                  {isVirtual && platformName ? (
                    <div>
                      <div className="text-white font-normal">{platformName}</div>
                      <div className="text-sm text-gray-400 truncate">{getDisplayAddress()}</div>
                    </div>
                  ) : (
                    location.name && location.address && location.name !== location.address ? (
                      <div>
                        <div className="text-white font-normal">{location.name}</div>
                        <div className="text-sm text-gray-400 truncate">{location.address}</div>
                      </div>
                    ) : (
                      <span>{getDisplayAddress()}</span>
                    )
                  )}
                </div>
                <span 
                  role="button"
                  tabIndex={0}
                  onClick={handleClearLocation}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClearLocation(e as unknown as React.MouseEvent);
                    }
                  }}
                  className="ml-2 text-gray-500 hover:text-red-500 cursor-pointer"
                  aria-label="清除位置"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </span>
              </div>
            ) : (
              <div>
                <div className="text-white font-normal">Add Event Location</div>
                <div className="text-sm text-gray-400">Offline location or virtual link</div>
              </div>
            )}
          </div>
        </div>
      </button>
      
      {/* 擴展面板 - 包含所有選項 */}
      {isExpanded && (
        <div 
          ref={panelRef}
          className="absolute z-50 top-full left-0 w-full bg-zinc-900 border border-neutral-700 shadow-lg rounded-md overflow-hidden mt-1"
        >
          {/* 搜索輸入框 */}
          <div className="p-0">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter location or virtual link"
              className="w-full p-4 bg-zinc-800 border-0 rounded-none focus:outline-none focus:ring-0 placeholder-gray-500 text-white"
              autoComplete="off"
            />
          </div>
          
          {/* 顯示搜索預測結果或選項 */}
          {inputValue.trim() ? (
            <div>
              {/* 搜索預測結果 */}
              {predictions.length > 0 && (
                <div className="border-t border-neutral-700">
                  {predictions.map((prediction) => (
                    <div
                      key={prediction.id}
                      onClick={() => handlePredictionSelect(prediction)}
                      className="flex items-start px-4 py-3 cursor-pointer hover:bg-zinc-800"
                    >
                      <div className="flex-shrink-0 mr-2 mt-1 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="10" r="3" />
                          <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                        </svg>
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-white text-sm">{prediction.mainText || prediction.name}</span>
                        <span className="text-gray-400 text-xs truncate">{prediction.secondaryText || prediction.address}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 虛擬會議選項 - 當輸入可能是虛擬連結時顯示 */}
              {detectVirtualPlatform(inputValue).isVirtual && (
                <div className={`${predictions.length > 0 ? 'border-t' : ''} border-neutral-700`}>
                  <div 
                    onClick={handleUseCustomAddress}
                    className="flex items-start px-4 py-3 cursor-pointer hover:bg-zinc-800"
                  >
                    <div className="flex-shrink-0 mr-2 mt-1 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 7l-7 5 7 5V7z"></path>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-white text-sm">
                        {detectVirtualPlatform(inputValue).platformName}
                      </span>
                      <span className="text-gray-400 text-xs truncate">{inputValue}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 使用自定義文字選項 - 始終顯示在底部 */}
              <div className={`${predictions.length > 0 || detectVirtualPlatform(inputValue).isVirtual ? 'border-t' : ''} border-neutral-700`}>
                <div 
                  onClick={handleUseCustomAddress}
                  className="flex items-start px-4 py-3 cursor-pointer hover:bg-zinc-800"
                >
                  <div className="flex-shrink-0 mr-2 mt-1 text-gray-400">
                    {detectVirtualPlatform(inputValue).isVirtual ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 7l-7 5 7 5V7z"></path>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12"></path>
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-white text-sm">Use &quot;{inputValue}&quot;</span>
                    {detectVirtualPlatform(inputValue).isVirtual && detectVirtualPlatform(inputValue).platformName !== 'Virtual' && (
                      <span className="text-gray-400 text-xs">{detectVirtualPlatform(inputValue).platformName}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Google標識 */}
              <div className="border-t border-neutral-700 p-2 text-right">
                <span className="text-xs text-gray-500">Powered by Google</span>
              </div>
            </div>
          ) : (
            <>
              {/* 無輸入時顯示最近位置和虛擬選項 */}
              <div className="px-4 py-2 border-t border-neutral-700">
                <div className="text-sm text-white mb-2">Recent Locations</div>
                <div className="text-sm text-gray-400">No recently used locations.</div>
              </div>
              
              <div className="px-4 py-2 border-t border-neutral-700">
                <div className="text-sm text-white mb-2">Virtual Options</div>
                <button 
                  type="button"
                  className="w-full flex items-center px-0 py-2 text-left text-white hover:bg-zinc-800 text-sm"
                >
                  <svg className="mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                  Create Zoom meeting
                </button>
                <button 
                  type="button"
                  className="w-full flex items-center px-0 py-2 text-left text-white hover:bg-zinc-800 text-sm"
                >
                  <svg className="mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                  Select existing Zoom
                </button>
                <div className="mt-2 text-xs text-gray-400">
                  If you have a virtual event link, you can enter or paste it above.
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector; 