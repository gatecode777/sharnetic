// Shared form rules for every form on the site.
//
//   Person name : letters and spaces only, max 50 characters
//   Phone       : digits only, max 10 (a valid number is exactly 10 digits)
//   Email       : must contain "@" (name@domain.tld)
//
// clean*()  -> use in onChange: silently drops characters that are not allowed.
// isValid*() / *Error() -> use on submit.

export const NAME_MAX_LENGTH = 50;
export const PHONE_LENGTH = 10;

/** Letters and spaces only, single spaces, max 50 characters. */
export const cleanName = (value = '') =>
  String(value ?? '')
    .replace(/[^A-Za-z ]/g, '')
    .replace(/ {2,}/g, ' ')
    .replace(/^ +/, '')
    .slice(0, NAME_MAX_LENGTH);

/**
 * Digits only, max 10. A pasted "+91 98765 43210" / "+919876543210" / "0091-..." keeps
 * the 10-digit mobile number (the country code is dropped only when written with + / 00 / a separator,
 * so typing digits one by one is never altered).
 */
export const cleanPhone = (value = '') =>
  String(value ?? '')
    .replace(/^\s*(?:(?:\+|00)\s*91|91(?=[\s-]))[\s-]*/, '')
    .replace(/\D/g, '')
    .slice(0, PHONE_LENGTH);

export const cleanEmail = (value = '') => String(value ?? '').replace(/\s/g, '');

export const isValidName = (value = '') => {
  const v = String(value ?? '').trim();
  return v.length > 0 && v.length <= NAME_MAX_LENGTH && /^[A-Za-z ]+$/.test(v);
};

export const isValidPhone = (value = '') => /^\d{10}$/.test(String(value ?? ''));

export const isValidEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());

/* Ready-made messages (return '' when valid). `required: false` lets an empty optional field pass. */

export const nameError = (value, { label = 'Name', required = true } = {}) => {
  const v = String(value ?? '').trim();
  if (!v) return required ? `${label} is required` : '';
  return isValidName(v) ? '' : `${label} can contain only letters and spaces (max ${NAME_MAX_LENGTH} characters)`;
};

export const phoneError = (value, { label = 'Phone number', required = true } = {}) => {
  const v = String(value ?? '').trim();
  if (!v) return required ? `${label} is required` : '';
  return isValidPhone(v) ? '' : `${label} must be exactly ${PHONE_LENGTH} digits`;
};

export const emailError = (value, { label = 'Email', required = true } = {}) => {
  const v = String(value ?? '').trim();
  if (!v) return required ? `${label} is required` : '';
  if (!v.includes('@')) return `${label} must contain "@"`;
  return isValidEmail(v) ? '' : `Please enter a valid ${label.toLowerCase()} (e.g. name@example.com)`;
};

/**
 * Spread onto a phone <input>: numeric keypad on phones, no browser length cut-off (cleanPhone limits it).
 * autoComplete "off": fields start empty and the browser does not offer to fill them.
 */
export const phoneInputProps = { inputMode: 'numeric', autoComplete: 'off' };

/** Spread onto a person-name <input>. */
export const nameInputProps = { maxLength: NAME_MAX_LENGTH, autoComplete: 'off' };
