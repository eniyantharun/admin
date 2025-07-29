import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { loadGoogleMaps } from '@/lib/loadGoogleMaps';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter address",
  className = "",
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!inputRef.current || disabled) return;

    const initAutocomplete = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        await loadGoogleMaps();
        
        if (!inputRef.current) return;

        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: ['us', 'ca'] }
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.formatted_address) {
            onChange(place.formatted_address);
            onPlaceSelect?.(place);
          }
        });
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        setError('Address autocomplete unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    initAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [disabled, onChange, onPlaceSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isLoading ? (
          <Loader className="w-4 h-4 text-gray-400 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4 text-gray-400" />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
      />
      {error && (
        <p className="text-xs text-amber-600 mt-1">{error}</p>
      )}
    </div>
  );
};