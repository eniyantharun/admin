import React, { useEffect, useRef, useState } from "react";
import { MapPin, Loader } from "lucide-react";
import { loadGoogleMaps } from "@/lib/loadGoogleMaps";
import { iAddressAutocompleteProps } from "@/types";
import { showToast } from "@/components/ui/toast";

export const AddressAutocomplete: React.FC<iAddressAutocompleteProps> = ({
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!containerRef.current || disabled) return;

    const initAutocomplete = async () => {
      try {
        setIsLoading(true);
        setError("");

        await loadGoogleMaps();

        if (!containerRef.current) return;

        const placeAutocomplete =
          new google.maps.places.PlaceAutocompleteElement({});

        autocompleteElementRef.current = placeAutocomplete;

        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(placeAutocomplete);

        placeAutocomplete.addEventListener("gmp-select", async (event: any) => {
          try {
            const placePrediction = event.placePrediction;
            const place = placePrediction.toPlace();

            await place.fetchFields({
              fields: [
                "formattedAddress",
                "addressComponents",
                "location",
                "displayName",
              ],
            });

            if (place.formattedAddress) {
              onChange(place.formattedAddress);
            }

            if (onPlaceSelect) {
              onPlaceSelect(place);
            }
          } catch (error) {
            showToast.error("Error processing selected address");
            setError("Error processing selected address");
          }
        });

        if (value) {
          const input = placeAutocomplete.querySelector("input");
          if (input) {
            input.value = value;
          }
        }
      } catch (error) {
        showToast.error("Address autocomplete unavailable");
        setError("Address autocomplete unavailable");
      } finally {
        setIsLoading(false);
      }
    };

    initAutocomplete();

    return () => {
      if (autocompleteElementRef.current) {
        autocompleteElementRef.current.remove();
        autocompleteElementRef.current = null;
      }
    };
  }, [disabled, onPlaceSelect]); 

  useEffect(() => {
    if (autocompleteElementRef.current && value !== undefined) {
      const input = autocompleteElementRef.current.querySelector("input");
      if (input && input.value !== value) {
        input.value = value;
      }
    }
  }, [value]);

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

      <div
        ref={containerRef}
        className={`w-full ${className}`}
        style={
          {
            "--gmp-primary-color": "#3b82f6",
            "--gmp-background-color": "#ffffff",
          } as React.CSSProperties
        }
      />

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
