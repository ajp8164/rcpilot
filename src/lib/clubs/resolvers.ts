import { COUNTRY_CODES } from './countryCodes';
import { US_STATES } from './usStates';

// Resolve a string to a US state abbreviation (by abbreviation or full name).
export const resolveState = (value: string): string | undefined => {
  const upper = value.toUpperCase();
  if (US_STATES[upper]) return upper;
  const lower = value.toLowerCase();
  for (const [abbr, name] of Object.entries(US_STATES)) {
    if (name.toLowerCase() === lower) return abbr;
  }
  return undefined;
};

// Check if a 2-letter code is a country code that does NOT conflict with a
// US state abbreviation (when the user is in the US).
export const resolveCountry = (
  value: string,
  deviceCountry: string,
): string | undefined => {
  const upper = value.toUpperCase();
  if (!COUNTRY_CODES.has(upper)) return undefined;
  // If user is in the US, don't treat US state abbreviations as country codes.
  if (deviceCountry === 'US' && US_STATES[upper]) return undefined;
  return upper;
};
