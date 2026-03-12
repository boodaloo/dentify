export const PHONE_MASK_KEY     = 'clinicPhoneMask';
export const DEFAULT_PHONE_MASK = '7(XXX)XXX-XX-XX';

export const PHONE_MASK_PRESETS = [
  { label: 'Russia',        mask: '7(XXX)XXX-XX-XX' },
  { label: '+7 Russia',     mask: '+7(XXX)XXX-XX-XX' },
  { label: 'International', mask: '+X(XXX)XXX-XX-XX' },
  { label: 'US/Canada',     mask: '+1(XXX)XXX-XXXX' },
];

export const getPhoneMask = (): string =>
  localStorage.getItem(PHONE_MASK_KEY) || DEFAULT_PHONE_MASK;

export const setPhoneMaskPref = (mask: string) =>
  localStorage.setItem(PHONE_MASK_KEY, mask);

/** Replace every X in mask with '_' to produce a visual placeholder. */
export const maskToPlaceholder = (mask: string): string =>
  mask.replace(/X/g, '_');

/**
 * Format a raw string (may contain digits, spaces, dashes, parens) into
 * the configured mask. X in the mask = one digit slot.
 *
 * Examples with mask '7(XXX)XXX-XX-XX':
 *   '9161234567'   → '7(916)123-45-67'
 *   '79161234567'  → '7(916)123-45-67'
 *   '89161234567'  → '7(916)123-45-67'
 *   '916'          → '7(916'
 *   ''             → ''
 */
export const formatPhone = (raw: string, mask?: string): string => {
  const activeMask = mask ?? getPhoneMask();

  // Extract all digits from the raw value
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  // Locate first X slot
  const firstXIdx = activeMask.indexOf('X');
  if (firstXIdx === -1) return digits;

  // Prefix = everything before the first X (e.g. "7(" or "+7(" or "+")
  const prefix       = activeMask.slice(0, firstXIdx);
  const prefixDigits = prefix.replace(/\D/g, '');          // e.g. "7" or ""
  const xCount       = (activeMask.match(/X/g) || []).length;

  // Strip any leading country-code digit that is already encoded in the prefix
  let userDigits = digits;
  if (prefixDigits) {
    if (userDigits.startsWith(prefixDigits)) {
      userDigits = userDigits.slice(prefixDigits.length);
    } else if (prefixDigits === '7' && userDigits.startsWith('8')) {
      // Russian shorthand: 8XXXXXXXXXX → treat same as 7XXXXXXXXXX
      userDigits = userDigits.slice(1);
    }
  }
  userDigits = userDigits.slice(0, xCount);

  if (!userDigits) return '';

  // Build formatted string: start with prefix, then walk rest of mask
  let result         = prefix;
  let dIdx           = 0;
  let pendingLiterals = '';

  for (let i = firstXIdx; i < activeMask.length; i++) {
    if (activeMask[i] === 'X') {
      if (dIdx < userDigits.length) {
        result += pendingLiterals + userDigits[dIdx++];
        pendingLiterals = '';
      } else {
        break; // No more user digits — stop here (no trailing punctuation)
      }
    } else {
      pendingLiterals += activeMask[i]; // Buffer literal until next digit
    }
  }

  return result;
};

/** Extract only digits from a formatted phone string. */
export const phoneDigits = (formatted: string): string =>
  formatted.replace(/\D/g, '');
