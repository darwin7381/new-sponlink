declare namespace google {
  namespace maps {
    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, options?: AutocompleteOptions);
        addListener(event: string, handler: () => void): void;
        getPlace(): AutocompletePlace;
      }
      
      interface AutocompleteOptions {
        fields: string[];
        types: string[];
      }
      
      interface AutocompletePlace {
        name?: string;
        address_components?: GeocoderAddressComponent[];
        formatted_address?: string;
        geometry?: {
          location: {
            lat: () => number;
            lng: () => number;
          }
        };
      }

      interface AutocompletePrediction {
        description: string;
        place_id: string;
        structured_formatting?: {
          main_text: string;
          secondary_text: string;
        };
      }

      class AutocompleteService {
        getPlacePredictions(
          request: {
            input: string;
            types?: string[];
            componentRestrictions?: {
              country: string | string[];
            };
          },
          callback: (
            results: AutocompletePrediction[] | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      class PlacesService {
        constructor(attrContainer: HTMLElement | google.maps.Map);
        getDetails(
          request: {
            placeId: string;
            fields: string[];
          },
          callback: (
            result: AutocompletePlace | null,
            status: PlacesServiceStatus
          ) => void
        ): void;
      }

      enum PlacesServiceStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR',
        NOT_FOUND = 'NOT_FOUND'
      }
    }
    
    namespace event {
      function clearInstanceListeners(instance: places.Autocomplete | object): void;
    }
    
    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }
  }
}

// 将Google Maps添加到window对象
interface Window {
  google: typeof google;
  initGoogleMapsCallback: () => void;
  googleMapsInitialized?: boolean;
} 