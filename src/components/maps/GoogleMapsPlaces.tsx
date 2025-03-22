'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define place details structure
interface PlaceDetails {
  name: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
}

// Prediction structure for the new Places API
interface Prediction {
  id: string;
  description: string;
  displayName?: {
    text: string;
    languageCode: string;
  };
  formattedAddress?: string;
  mainText?: string;
  secondaryText?: string;
}

// Define Place API response interfaces
interface PlaceApiResponse {
  places?: PlaceApiPlace[];
  error?: {
    message?: string;
    status?: string;
  };
}

interface PlaceApiPlace {
  id: string;
  displayName?: {
    text: string;
    languageCode: string;
  };
  formattedAddress?: string;
}

interface PlaceDetailsResponse {
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  addressComponents?: AddressComponent[];
}

interface AddressComponent {
  types: string[];
  longText: string;
}

interface GoogleMapsPlacesProps {
  onPlaceSelect: (place: PlaceDetails) => void;
  placeholder?: string;
  label?: string;
  defaultValue?: string;
  className?: string;
}

/**
 * GoogleMapsPlaces Component
 * 
 * IMPORTANT NOTES:
 * - This is a GLOBAL search component with NO geographical restrictions
 * - Uses Places API (New) available at places.googleapis.com/v1
 * - The old Places API was deprecated and caused REQUEST_DENIED errors
 * - For this to work, you need to:
 *   1. Enable "Places API (New)" in Google Cloud Console
 *   2. Configure billing information
 *   3. Ensure API key restrictions are properly set
 * 
 * Last updated: April 2024
 */
const GoogleMapsPlaces: React.FC<GoogleMapsPlacesProps> = ({
  onPlaceSelect,
  placeholder = 'Search for a place',
  label = 'Search for a place',
  defaultValue = '',
  className = ''
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [inputValue, setInputValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Load Google Maps JavaScript API
  useEffect(() => {
    // Check if API is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      return;
    }
    
    // Check if script is already being loaded
    if (document.getElementById('google-maps-api')) {
      console.log('Google Maps API script exists, waiting for it to load...');
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          console.log('Google Maps API has finished loading');
          clearInterval(checkInterval);
        }
      }, 500);
      return () => clearInterval(checkInterval);
    }
    
    console.log('Starting to load Google Maps API');
    
    const script = document.createElement('script');
    script.id = 'google-maps-api';
    // We only need the basic Maps JavaScript API for geocoding
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=Function.prototype`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      if (window.google && window.google.maps) {
        console.log('Google Maps API available');
      } else {
        console.error('Google Maps script loaded but API object is not available');
        setLoadError('Unable to access Google Maps API, please check your API key settings');
      }
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps API:', error);
      setLoadError('Unable to load map service. Please check: 1) Network connection; 2) API key validity; 3) Billing setup');
    };
    
    document.head.appendChild(script);
    
    return () => {
      const scriptElement = document.getElementById('google-maps-api');
      if (scriptElement) {
        try {
          document.head.removeChild(scriptElement);
        } catch (e) {
          console.error('Error cleaning up Google Maps script:', e);
        }
      }
    };
  }, [apiKey]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (!value.trim()) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }
    
    fetchPredictions(value);
  };
  
  // Fetch place predictions using the new Places API directly - NO geographic restrictions
  const fetchPredictions = async (input: string) => {
    if (!input.trim()) return;
    
    try {
      // Using the new Places API (New) with global search (no country restrictions)
      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
        },
        body: JSON.stringify({
          textQuery: input,
          languageCode: 'en' // Using English as default language
        })
      });
      
      const data = await response.json() as PlaceApiResponse;
      
      if (response.ok && data.places && data.places.length > 0) {
        console.log('Prediction results:', data.places);
        
        // Transform to our prediction format
        const transformedPredictions = data.places.map((place: PlaceApiPlace) => ({
          id: place.id,
          description: place.formattedAddress || place.displayName?.text || '',
          displayName: place.displayName,
          formattedAddress: place.formattedAddress,
          mainText: place.displayName?.text || '',
          secondaryText: place.formattedAddress || ''
        }));
        
        setPredictions(transformedPredictions);
        setShowPredictions(true);
        setLoadError(null);
      } else {
        console.warn('Failed to get predictions:', data);
        setPredictions([]);
        setShowPredictions(false);
        
        if (data.error) {
          setLoadError(`API Error: ${data.error.message || data.error.status || 'Unknown error'}`);
        } else if (data.places && data.places.length === 0) {
          setLoadError('No matching locations found. Try different search terms.');
        } else {
          setLoadError('Search request failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Prediction request error:', error);
      setLoadError('An unknown error occurred with the search service. Check console for details.');
      setPredictions([]);
      setShowPredictions(false);
    }
  };
  
  // Handle prediction selection
  const handlePredictionSelect = async (prediction: Prediction) => {
    setInputValue(prediction.description || prediction.mainText || '');
    setShowPredictions(false);
    
    try {
      // Fetch place details using the new Places API (New)
      const response = await fetch(`https://places.googleapis.com/v1/places/${prediction.id}`, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'displayName,formattedAddress,location,addressComponents'
        }
      });
      
      const placeData = await response.json() as PlaceDetailsResponse;
      
      if (response.ok && placeData) {
        console.log('Selected place details:', placeData);
        
        // Extract address components
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
        
        // Build place details
        const placeDetail: PlaceDetails = {
          name: placeData.displayName?.text || prediction.mainText || '',
          address: placeData.formattedAddress || prediction.description || '',
          city,
          country,
          postal_code,
          latitude: placeData.location?.latitude || 0,
          longitude: placeData.location?.longitude || 0
        };
        
        console.log('Selected place with details:', placeDetail);
        onPlaceSelect(placeDetail);
      } else {
        console.error('Failed to get place details:', placeData);
        
        // Even if we can't get full details, provide basic info
        onPlaceSelect({
          name: prediction.mainText || prediction.displayName?.text || '',
          address: prediction.description || prediction.formattedAddress || '',
          city: prediction.secondaryText || '',
          country: '',
          postal_code: '',
          latitude: 0,
          longitude: 0
        });
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      
      // Fallback with basic info
      onPlaceSelect({
        name: prediction.mainText || prediction.displayName?.text || '',
        address: prediction.description || prediction.formattedAddress || '',
        city: prediction.secondaryText || '',
        country: '',
        postal_code: '',
        latitude: 0,
        longitude: 0
      });
    }
  };
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowPredictions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle input focus
  const handleFocus = () => {
    if (inputValue && predictions.length > 0) {
      setShowPredictions(true);
    }
  };
  
  // Render prediction item - Simplified like Luma's style
  const renderPredictionItem = (prediction: Prediction) => {
    return (
      <div 
        key={prediction.id}
        className="flex items-start px-3 py-2 hover:bg-accent cursor-pointer"
        onClick={() => handlePredictionSelect(prediction)}
      >
        <div className="flex-shrink-0 mr-2 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="3" />
            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
          </svg>
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-medium text-sm">{prediction.mainText || prediction.displayName?.text}</span>
          <span className="text-xs text-muted-foreground truncate">{prediction.secondaryText || prediction.formattedAddress}</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`relative ${className}`}>
      {label && <Label htmlFor="location-search">{label}</Label>}
      <div className="relative">
        <Input
          ref={inputRef}
          id="location-search"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="mt-1 bg-background border-border"
          autoComplete="off"
        />
      </div>
      
      {/* Error messages */}
      {loadError && (
        <div className="text-red-500 text-xs mt-1 mb-2">
          <div className="font-medium">Error:</div>
          <div className="mt-1">{loadError}</div>
          <div className="mt-2 text-xs text-foreground">
            <span className="font-medium">Solution:</span> Please visit 
            <a 
              href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline text-blue-500 hover:text-blue-700 ml-1"
            >
              Google Cloud Console
            </a>
            <span className="ml-1">to enable Places API (New) and set up billing</span>
          </div>
        </div>
      )}
      
      {/* Predictions dropdown - Luma style */}
      {showPredictions && predictions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-background border border-border shadow-lg rounded-md max-h-60 overflow-auto"
        >
          <div className="py-1">
            {predictions.map(prediction => renderPredictionItem(prediction))}
          </div>
          <div className="border-t border-border p-2 text-right">
            <span className="text-xs text-gray-500">Powered by Google</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsPlaces;