// Country code to display name mapping for countries with club data.
// Add entries here as new countries are added to the club dataset.
export const COUNTRY_NAMES: Record<string, string> = {
  AU: 'Australia',
  CA: 'Canada',
  GB: 'United Kingdom',
  US: 'United States',
};

// Convert a 2-letter country code to its flag emoji.
export const countryFlag = (code: string): string => {
  const base = 0x1f1e6 - 65;
  return String.fromCodePoint(
    base + code.charCodeAt(0),
    base + code.charCodeAt(1),
  );
};
