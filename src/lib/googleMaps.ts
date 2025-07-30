import { iGoogleMapsResponse, iGoogleMapsAddress } from '@/types/customer';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const googleMapsUtils = {
  async verifyAddress(address: string): Promise<iGoogleMapsAddress | null> {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured');
      return null;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to verify address');
      }

      const data: iGoogleMapsResponse = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0];
      }

      return null;
    } catch (error) {
      console.error('Address verification error:', error);
      return null;
    }
  },

  formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const limitedCleaned = cleaned.slice(0, 10);
  if (limitedCleaned.length === 0) return '';
  if (limitedCleaned.length <= 3) {
    return `(${limitedCleaned}`;
  }
  if (limitedCleaned.length <= 6) {
    return `(${limitedCleaned.slice(0, 3)}) ${limitedCleaned.slice(3)}`;
  }
  if (limitedCleaned.length <= 10) {
    return `(${limitedCleaned.slice(0, 3)}) ${limitedCleaned.slice(3, 6)}-${limitedCleaned.slice(6)}`;
  }
  return phone; 
},

  parseGoogleAddress(googleAddress: iGoogleMapsAddress) {
    const components = googleAddress.address_components;
    
    const getComponent = (types: string[]) => {
      const component = components.find(comp => 
        types.some(type => comp.types.includes(type))
      );
      return component?.long_name || '';
    };

    const getShortComponent = (types: string[]) => {
      const component = components.find(comp => 
        types.some(type => comp.types.includes(type))
      );
      return component?.short_name || '';
    };

    const streetNumber = getComponent(['street_number']);
    const route = getComponent(['route']);
    const street = streetNumber && route ? `${streetNumber} ${route}` : (streetNumber || route);

    return {
      street: street || getComponent(['route']),
      city: getComponent(['locality']) || getComponent(['sublocality']),
      state: getShortComponent(['administrative_area_level_1']),
      zipCode: getComponent(['postal_code']),
      country: getShortComponent(['country']) === 'US' ? 'US' : getComponent(['country']),
      formatted: googleAddress.formatted_address
    };
  }
};