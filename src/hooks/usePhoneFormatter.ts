import { useState } from 'react';
import { googleMapsUtils } from '@/lib/googleMaps';

export const usePhoneFormatter = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);

  const formatAndSet = (newValue: string) => {
    const formatted = googleMapsUtils.formatPhoneNumber(newValue);
    setValue(formatted);
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const formatted = formatAndSet(newValue);
    
    e.target.value = formatted;
    return e;
  };

  return {
    value,
    setValue: formatAndSet,
    handleChange,
    formattedValue: value
  };
};