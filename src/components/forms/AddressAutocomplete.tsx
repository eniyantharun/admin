import React, { useEffect, useRef, useState } from "react";
import { MapPin, Loader } from "lucide-react";
import { loadGoogleMaps } from "@/lib/loadGoogleMaps";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.Place) => void;
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
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteElementRef =
    useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!containerRef.current || disabled) return;

    const initAutocomplete = async () => {
      try {
        setIsLoading(true);
        setError("");

        await loadGoogleMaps();

        if (!containerRef.current) return;

        // Create the new PlaceAutocompleteElement
        const placeAutocomplete =
          new google.maps.places.PlaceAutocompleteElement({});

        // Store reference for cleanup
        autocompleteElementRef.current = placeAutocomplete;

        // Clear any existing content and append the new element
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(placeAutocomplete);

        // Add event listener for place selection
        placeAutocomplete.addEventListener("gmp-select", async (event: any) => {
          try {
            // The event contains a placePrediction, not directly a place
            const placePrediction = event.placePrediction;
            const place = placePrediction.toPlace();

            // Fetch additional fields if needed
            await place.fetchFields({
              fields: [
                "formattedAddress",
                "addressComponents",
                "location",
                "displayName",
              ],
            });

            // Update the input value
            if (place.formattedAddress) {
              onChange(place.formattedAddress);
            }

            // Call the onPlaceSelect callback if provided
            if (onPlaceSelect) {
              onPlaceSelect(place);
            }
          } catch (error) {
            console.error("Error handling place selection:", error);
            setError("Error processing selected address");
          }
        });

        // Set initial value if provided
        if (value) {
          // The new API doesn't allow direct value setting the same way
          // You might need to handle this differently based on your use case
          const input = placeAutocomplete.querySelector("input");
          if (input) {
            input.value = value;
          }
        }
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        setError("Address autocomplete unavailable");
      } finally {
        setIsLoading(false);
      }
    };

    initAutocomplete();

    // Cleanup function
    return () => {
      if (autocompleteElementRef.current) {
        // Remove event listeners and clean up
        autocompleteElementRef.current.remove();
        autocompleteElementRef.current = null;
      }
    };
  }, [disabled, onPlaceSelect]); // Removed onChange and value from dependencies to prevent recreation

  // Handle manual input changes
  useEffect(() => {
    if (autocompleteElementRef.current && value !== undefined) {
      const input = autocompleteElementRef.current.querySelector("input");
      if (input && input.value !== value) {
        input.value = value;
      }
    }
  }, [value]);

  // Handle input events to sync with parent component
  useEffect(() => {
    if (!autocompleteElementRef.current) return;

    const input = autocompleteElementRef.current.querySelector("input");
    if (!input) return;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      onChange(target.value);
    };

    input.addEventListener("input", handleInput);

    return () => {
      input.removeEventListener("input", handleInput);
    };
  }, [onChange]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        {isLoading ? (
          <Loader className="w-4 h-4 text-gray-400 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* Container for the PlaceAutocompleteElement */}
      <div
        ref={containerRef}
        className={`w-full ${className}`}
        style={
          {
            // Ensure the autocomplete element takes full width and has proper styling
            "--gmp-primary-color": "#3b82f6",
            "--gmp-background-color": "#ffffff",
          } as React.CSSProperties
        }
      />

      {/* Fallback input for when Google Maps fails to load */}
      {error && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
        />
      )}

      {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}

      {/* Custom styles for the autocomplete element */}
      <style jsx>{`
        :global(gmp-place-autocomplete) {
          width: 100% !important;
        }

        :global(gmp-place-autocomplete input) {
          width: 100% !important;
          padding-left: 2.5rem !important;
          padding-right: 0.75rem !important;
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.5rem !important;
          font-size: 0.875rem !important;
          transition: all 0.2s !important;
        }

        :global(gmp-place-autocomplete input:focus) {
          outline: none !important;
          border-color: transparent !important;
          ring: 2px !important;
          ring-color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};
