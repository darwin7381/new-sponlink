'use client';

import React from 'react';
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
  };

  // Calculate current location string for default value
  const getDefaultAddressValue = () => {
    if (location.address) {
      return location.address;
    } else if (location.name && location.city) {
      return `${location.name}, ${location.city}${location.country ? `, ${location.country}` : ''}`;
    } else if (location.latitude && location.longitude) {
      return `(${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)})`;
    }
    return '';
  };

  // Handle location clearing
  const handleClearLocation = () => {
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

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-foreground">Location Information</h3>
        {(location.name || location.address) && (
          <button 
            type="button"
            onClick={handleClearLocation}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Clear Location
          </button>
        )}
      </div>
      
      {/* Google Places search input - Luma style */}
      <GoogleMapsPlaces 
        onPlaceSelect={handlePlaceSelect}
        label="Search for a place"
        placeholder="Enter and select an event location"
        defaultValue={getDefaultAddressValue()}
        className="mb-4"
      />
      
      {/* Show coordinates if location is selected */}
      {location.latitude && location.longitude && (
        <div className="mb-4 text-xs text-muted-foreground">
          Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default LocationSelector; 