import { useRealm } from '@realm/react';
import clubs from 'lib/content/clubs/MO.json';
import { DateTime } from 'luxon';
import { Address } from 'realmdb/Address';
import { LocationCoords } from 'realmdb/Location';

type Props = {
  suppressErrors?: boolean;
};

export const useClubs = (props: Props = {}) => {
  const { suppressErrors: _suppressErrors } = props;

  const realm = useRealm();

  const get = async () => {
    // Check and get clubs from firestore.
    // Update realm as needed.
    const now = DateTime.now().toISO();

    realm.write(() => {
      clubs.forEach(c => {
        console.log(c);

        const location = realm.create('Location', {
          createdOn: now,
          updatedOn: now,
          name: c.name || 'Unknown Club',
          coords: {
            latitude: c.latitude || 0,
            longitude: c.longitude || 0,
          } as LocationCoords,
        });

        realm.create('Club', {
          createdOn: now,
          updatedOn: now,
          name: c.name || 'Unknown Club',
          briefDescription: c.briefDescription || '',
          location,
          websiteUrl: c.websiteUrl || '',
          keyFeatures: c.keyFeatures || '',
          address: {
            street: c.address.street || '',
            city: c.address.city || '',
            state: c.address.state || '',
            zip: c.address.zip || '',
          } as Address,
          amaChartered: c.amaChartered,
          driving: c.driving,
          flying: c.flying,
          boating: c.boating,
        });
      });
    });
  };

  return { get };
};
