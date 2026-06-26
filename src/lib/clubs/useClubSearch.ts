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

export const useClubSearch = (
  clubs: Realm.Results<Club>,
  query: string,
): SearchResult[] => {
  return useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const q = trimmed.toLowerCase();

    // --- Location matches (max 5) ---
    const locationSet = new Set<string>();
    const matchedStateAbbr: string[] = [];

    // Match state abbreviation (exact, case-insensitive)
    const upperQuery = trimmed.toUpperCase();
    if (US_STATES[upperQuery]) {
      locationSet.add(`${US_STATES[upperQuery]}, USA`);
      matchedStateAbbr.push(upperQuery);
    }

    // Match state full name (starts-with, case-insensitive)
    for (const [abbr, name] of Object.entries(US_STATES)) {
      if (name.toLowerCase().startsWith(q) && !matchedStateAbbr.includes(abbr)) {
        locationSet.add(`${name}, USA`);
        matchedStateAbbr.push(abbr);
      }
    }

    // Match cities starting with the query
    for (const club of clubs) {
      if (locationSet.size >= MAX_LOCATIONS) break;
      const city = club.address?.city || '';
      if (city.toLowerCase().startsWith(q)) {
        const state = club.address?.state || '';
        locationSet.add(`${city}, ${state}`);
      }
    }

    // Include cities from matched states to fill up to MAX_LOCATIONS
    if (matchedStateAbbr.length > 0 && locationSet.size < MAX_LOCATIONS) {
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

    // --- Club matches (all, partial/contains on name, city, or state) ---
    const clubResults: ClubResult[] = clubs
      .filter(club => {
        const name = club.name.toLowerCase();
        const city = (club.address?.city || '').toLowerCase();
        const state = (club.address?.state || '').toLowerCase();
        return (
          name.includes(q) ||
          city.startsWith(q) ||
          state === q ||
          matchedStateAbbr.includes(club.address?.state || '')
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(club => ({ type: 'club', club }));

    return [...locationResults, ...clubResults];
  }, [query, clubs]);
};
