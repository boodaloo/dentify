import React from 'react';
import { formatPhone, getPhoneMask, maskToPlaceholder } from '../utils/phoneMask';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Drop-in replacement for <input type="tel">.
 * Applies the clinic phone mask from localStorage automatically.
 * Callers use onChange exactly as with a regular input (e.target.value → formatted).
 */
const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, placeholder, ...rest }) => {
  const mask = getPhoneMask();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value, mask);
    onChange({ ...e, target: { ...e.target, value: formatted } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <input
      {...rest}
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder={placeholder ?? maskToPlaceholder(mask)}
    />
  );
};

export default PhoneInput;
