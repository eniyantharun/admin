import React, { useState, useCallback } from 'react';
import { MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/helpers/FormInput';
import { AddressAutocomplete } from '@/components/forms/AddressAutocomplete';
import { CustomerAddressFormData } from '@/types/customer';
import { googleMapsUtils } from '@/lib/googleMaps';

interface AddressFormProps {
  address?: CustomerAddressFormData;
  onSubmit: (address: CustomerAddressFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CustomerAddressFormData>(
    address || {
      type: 'shipping',
      label: 'Home',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      isPrimary: false
    }
  );
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [verifiedAddress, setVerifiedAddress] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (['street', 'city', 'state', 'zipCode'].includes(name)) {
      setVerificationStatus('idle');
      setVerifiedAddress('');
    }
  };

  const handlePlaceSelect = useCallback(async (place: google.maps.places.Place) => {
    try {
      // Fetch the address components if not already available
      await place.fetchFields({
        fields: ['addressComponents', 'formattedAddress']
      });

      if (!place.addressComponents) return;

      const getComponent = (types: string[]) => {
        const component = place.addressComponents?.find(comp => 
          types.some(type => comp.types.includes(type))
        );
        return component?.longText || '';
      };

      const streetNumber = getComponent(['street_number']);
      const route = getComponent(['route']);
      const street = streetNumber && route ? `${streetNumber} ${route}` : (streetNumber || route);

      setFormData(prev => ({
        ...prev,
        street: street || prev.street,
        city: getComponent(['locality', 'sublocality']) || prev.city,
        state: getComponent(['administrative_area_level_1']) || prev.state,
        zipCode: getComponent(['postal_code']) || prev.zipCode,
        country: getComponent(['country']) === 'United States' ? 'US' : getComponent(['country']) || prev.country
      }));

      setVerificationStatus('verified');
      setVerifiedAddress(place.formattedAddress || '');
    } catch (error) {
      console.error('Error processing place selection:', error);
      setVerificationStatus('failed');
    }
  }, []);

  const handleAddressChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, street: value }));
    setVerificationStatus('idle');
    setVerifiedAddress('');
  }, []);

  const verifyAddress = useCallback(async () => {
    const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
    
    if (!formData.street || !formData.city) {
      return;
    }

    setVerificationStatus('verifying');

    try {
      const verified = await googleMapsUtils.verifyAddress(fullAddress);
      
      if (verified) {
        const parsed = googleMapsUtils.parseGoogleAddress(verified);
        setVerifiedAddress(verified.formatted_address);
        setVerificationStatus('verified');
        
        setFormData(prev => ({
          ...prev,
          street: parsed.street || prev.street,
          city: parsed.city || prev.city,
          state: parsed.state || prev.state,
          zipCode: parsed.zipCode || prev.zipCode,
          country: parsed.country === 'United States' ? 'US' : parsed.country || prev.country
        }));
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      setVerificationStatus('failed');
    }
  }, [formData.street, formData.city, formData.state, formData.zipCode, formData.country]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getVerificationMessage = () => {
    switch (verificationStatus) {
      case 'verifying':
        return { text: 'Verifying address...', color: 'text-blue-600', icon: CheckCircle };
      case 'verified':
        return { text: `Verified: ${verifiedAddress}`, color: 'text-green-600', icon: CheckCircle };
      case 'failed':
        return { text: 'Address verification failed', color: 'text-red-600', icon: AlertCircle };
      default:
        return null;
    }
  };

  const verificationMessage = getVerificationMessage();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Type <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="billing">Billing</option>
            <option value="shipping">Shipping</option>
          </select>
        </div>

        <FormInput
          label="Address Label"
          name="label"
          value={formData.label}
          onChange={handleInputChange}
          required
          placeholder="e.g., Home, Office, Warehouse"
        />
      </div>

      <FormInput
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        required
        placeholder="Full name for this address"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address <span className="text-red-500">*</span>
        </label>
        <AddressAutocomplete
          value={formData.street}
          onChange={handleAddressChange}
          onPlaceSelect={handlePlaceSelect}
          placeholder="Start typing address for suggestions..."
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="City"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          required
          placeholder="City"
        />

        <FormInput
          label="State"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          required
          placeholder="State"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="ZIP Code"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleInputChange}
          required
          placeholder="ZIP Code"
        />

        <FormInput
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          required
          placeholder="Country"
        />
      </div>

      <div className="flex items-center justify-between">
        <FormInput
          label=""
          name="isPrimary"
          type="checkbox"
          value={formData.isPrimary}
          onChange={handleInputChange}
          placeholder="Set as primary address"
        />

        <Button
          type="button"
          onClick={verifyAddress}
          variant="secondary"
          size="sm"
          icon={MapPin}
          loading={verificationStatus === 'verifying'}
          disabled={!formData.street || !formData.city}
        >
          Verify Address
        </Button>
      </div>

      {verificationMessage && (
        <div className={`flex items-center gap-2 text-sm ${verificationMessage.color}`}>
          <verificationMessage.icon className="w-4 h-4" />
          <span>{verificationMessage.text}</span>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          {address ? 'Update Address' : 'Add Address'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};