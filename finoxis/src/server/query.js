/**
 * Guard rails for public query strings (?page=, ?limit=, ?search=).
 * Normal values pass through unchanged; abusive or broken ones are clamped.
 */

const MAX_PAGE = 100000;
const MAX_SEARCH_LENGTH = 100;

const first = (value) => (Array.isArray(value) ? value[0] : value);

/** Whole number from 1 to max; anything else becomes the fallback. */
const toBoundedInt = (value, fallback, max) => {
  const n = parseInt(first(value), 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
};

export const toPageNumber = (value) => toBoundedInt(value, 1, MAX_PAGE);

export const toLimit = (value, fallback, max) => toBoundedInt(value, fallback, max);

/** Search text for a MongoDB $regex: trimmed, length-capped and matched literally. */
export const toSearchPattern = (value) =>
  String(first(value) ?? '')
    .trim()
    .slice(0, MAX_SEARCH_LENGTH)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
