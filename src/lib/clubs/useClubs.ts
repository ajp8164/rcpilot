import { useRef } from 'react';

import { useRealm } from '@realm/react';
import { allClubs } from 'lib/clubs';
import { DateTime } from 'luxon';
import { Address } from 'realmdb/Address';
import { Club as RealmClub } from 'realmdb/Club';
import { LocationCoords } from 'realmdb/Location';
import { Club } from 'types/club';

const BATCH_SIZE = 25;

type Props = {
  suppressErrors?: boolean;
};

export const useClubs = (props: Props = {}) => {
  const { suppressErrors: _suppressErrors } = props;

  const realm = useRealm();
  const clubs = allClubs as Club[];
  const realmClubs = realm.objects(RealmClub);

  const initialized = useRef(false);

  const yieldToUI = () =>
    new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

  const get = async () => {
    if (initialized.current) return;
    initialized.current = true;

    const now = DateTime.now().toISO();

    // Process in small batches to be UI responsive.
    for (let i = 0; i < clubs.length; i += BATCH_SIZE) {
      const batch = clubs.slice(i, i + BATCH_SIZE);

      realm.write(() => {
        for (const c of batch) {
          const existingClub = realmClubs.find(rc => rc.clubId === c.id);

          if (existingClub) {
            const hasLocationChanges =
              existingClub.location?.coords.latitude !== c.latitude ||
              existingClub.location?.coords.longitude !== c.longitude ||
              existingClub.location?.name !== c.name;

            if (hasLocationChanges) {
              existingClub.location.updatedOn = now;
              existingClub.location.name = c.name;
              existingClub.location.coords.latitude = c.latitude;
              existingClub.location.coords.longitude = c.longitude;
            }

            const hasDetailChanges = existingClub.modifiedOn !== c.modifiedOn;

            if (hasDetailChanges) {
              existingClub.updatedOn = now;
              existingClub.addedOn = c.addedOn;
              existingClub.modifiedOn = c.modifiedOn;
              existingClub.name = c.name;
              existingClub.description = c.description;
              existingClub.websiteUrl = c.websiteUrl;
              existingClub.keyFeatures = c.keyFeatures;
              existingClub.address = { ...c.address } as Address;
              existingClub.amaChartered = c.amaChartered;
              existingClub.driving = c.driving;
              existingClub.flying = c.flying;
              existingClub.boating = c.boating;
            }
          } else {
            const location = realm.create('Location', {
              createdOn: now,
              updatedOn: now,
              name: c.name,
              coords: {
                latitude: c.latitude || 0,
                longitude: c.longitude || 0,
              } as LocationCoords,
            });

            realm.create('Club', {
              createdOn: now,
              updatedOn: now,
              addedOn: c.addedOn,
              modifiedOn: c.modifiedOn,
              clubId: c.id,
              name: c.name,
              description: c.description,
              location,
              websiteUrl: c.websiteUrl,
              keyFeatures: c.keyFeatures,
              address: { ...c.address } as Address,
              amaChartered: c.amaChartered,
              driving: c.driving,
              flying: c.flying,
              boating: c.boating,
            });
          }
        }
      });

      await yieldToUI();
    }
  };

  return { get };
};
