import { useMemo } from 'react';

import { Club } from 'realmdb';

import { US_STATES } from './usStates';

export type LocationResult = {
  type: 'location';
  label: string; // e.g. "Dallas, TX" or "Arkansas, USA"
};

export type ClubResult = {
  type: 'club';
  club: Club;
};

export type SearchResult = LocationResult | ClubResult;

const MAX_LOCATIONS = 5;

// Resolve a string to a state abbreviation if it matches (abbreviation or full name).
const resolveState = (value: string): string | undefined => {
  const upper = value.toUpperCase();
  if (US_STATES[upper]) return upper;
  const lower = value.toLowerCase();
  for (const [abbr, name] of Object.entries(US_STATES)) {
    if (name.toLowerCase() === lower) return abbr;
  }
  return undefined;
};

export const useClubSearch = (
  clubs: Realm.Results<Club>,
  query: string,
): SearchResult[] => {
  return useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    // Normalized query (no commas, lowercase) for general matching.
    const q = trimmed.replace(/,/g, '').trim().toLowerCase();

    // Parse "city state" or "city, state" pattern.
    const parts = trimmed
      .replace(/,/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    let hasCityState = false;
    let cityPart: string | undefined;
    let statePart: string | undefined;

    if (parts.length >= 2) {
      // Try last word as state.
      const resolved = resolveState(parts[parts.length - 1]);
      if (resolved) {
        hasCityState = true;
        cityPart = parts.slice(0, -1).join(' ').toLowerCase();
        statePart = resolved;
      }
      // Try last two words as state (e.g. "New York").
      if (!hasCityState && parts.length >= 3) {
        const resolved2 = resolveState(parts.slice(-2).join(' '));
        if (resolved2) {
          hasCityState = true;
          cityPart = parts.slice(0, -2).join(' ').toLowerCase();
          statePart = resolved2;
        }
      }
    }

    // --- Location matches (max 5, alpha sorted) ---
    const locationSet = new Set<string>();
    const matchedStateAbbr: string[] = [];

    // Match state abbreviation (exact).
    const upperQuery = trimmed.replace(/,/g, '').trim().toUpperCase();
    if (US_STATES[upperQuery]) {
      locationSet.add(`${US_STATES[upperQuery]}, USA`);
      matchedStateAbbr.push(upperQuery);
    }

    // Match state full name (starts-with).
    for (const [abbr, name] of Object.entries(US_STATES)) {
      if (
        name.toLowerCase().startsWith(q) &&
        !matchedStateAbbr.includes(abbr)
      ) {
        locationSet.add(`${name}, USA`);
        matchedStateAbbr.push(abbr);
      }
    }

    // Include the resolved state from city+state parsing.
    if (hasCityState && statePart && !matchedStateAbbr.includes(statePart)) {
      matchedStateAbbr.push(statePart);
    }

    // Match cities (starts-with query or city+state combo).
    for (const club of clubs) {
      if (locationSet.size >= MAX_LOCATIONS) break;
      const city = club.address?.city || '';
      const state = club.address?.state || '';

      if (hasCityState && cityPart && statePart) {
        if (city.toLowerCase().startsWith(cityPart) && state === statePart) {
          locationSet.add(`${city}, ${state}`);
        }
      } else if (city.toLowerCase().startsWith(q)) {
        locationSet.add(`${city}, ${state}`);
      }
    }

    // Fill remaining location slots with cities from matched states
    // (only when not doing a specific city+state search).
    if (
      !hasCityState &&
      matchedStateAbbr.length > 0 &&
      locationSet.size < MAX_LOCATIONS
    ) {
      for (const club of clubs) {
        if (locationSet.size >= MAX_LOCATIONS) break;
        const state = club.address?.state || '';
        if (matchedStateAbbr.includes(state)) {
          const city = club.address?.city || '';
          if (city) {
            locationSet.add(`${city}, ${state}`);
          }
        }
      }
    }

    const locationResults: LocationResult[] = [...locationSet]
      .sort()
      .slice(0, MAX_LOCATIONS)
      .map(label => ({ type: 'location', label }));

    // --- Club matches (all, alpha sorted) ---
    const clubResults: ClubResult[] = clubs
      .filter(club => {
        const name = club.name.toLowerCase();
        const city = (club.address?.city || '').toLowerCase();
        const state = club.address?.state || '';

        if (hasCityState && cityPart && statePart) {
          return (
            (city.startsWith(cityPart) && state === statePart) ||
            name.includes(q)
          );
        }

        return (
          name.includes(q) ||
          city.startsWith(q) ||
          state.toLowerCase() === q ||
          matchedStateAbbr.includes(state)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(club => ({ type: 'club', club }));

    return [...locationResults, ...clubResults];
  }, [query, clubs]);
};
