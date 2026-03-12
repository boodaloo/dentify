import React, { useRef, useState, useEffect } from 'react';

const toDisplay = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
};

const toISO = (digits: string) => {
  if (digits.length < 8) return '';
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
};

const applyMask = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  let result = '';
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) result += '-';
    result += digits[i];
  }
  return result;
};

interface DateInputProps {
  value: string;
  onChange: (iso: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, className, style }) => {
  const [display, setDisplay] = useState(toDisplay(value));
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplay(toDisplay(value));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(e.target.value);
    setDisplay(masked);
    const iso = toISO(masked.replace(/\D/g, ''));
    if (iso) onChange(iso);
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value; // YYYY-MM-DD
    onChange(iso);
    setDisplay(toDisplay(iso));
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        value={display}
        onChange={handleTextChange}
        placeholder="ДД-ММ-ГГГГ"
        maxLength={10}
        className={className}
        style={{ paddingRight: 32, width: '100%', boxSizing: 'border-box', ...style }}
      />
      <button
        type="button"
        onClick={() => hiddenRef.current?.showPicker()}
        style={{
          position: 'absolute',
          right: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          color: 'var(--text-secondary)',
          fontSize: 16,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
        }}
        tabIndex={-1}
      >
        📅
      </button>
      <input
        ref={hiddenRef}
        type="date"
        value={value}
        onChange={handlePickerChange}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        tabIndex={-1}
      />
    </div>
  );
};

export default DateInput;
