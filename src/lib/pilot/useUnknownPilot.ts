import { useQuery, useRealm } from '@realm/react';

import { DateTime } from 'luxon';
import { Pilot } from 'realmdb/Pilot';
import { saveSelectedPilot } from 'store/slices/pilot';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

export const useUnknownPilot = () => {
  const dispatch = useDispatch();
  const realm = useRealm();

  const pilot = useQuery(Pilot, pilots => pilots.filtered('unknownPilot == true'));

  useEffect(() => {
    if (!pilot.length) {
      // Lazily create the unknown pilot.
      realm.write(() => {
        const now = DateTime.now().toISO();
        const unknownPilot = realm.create('Pilot', {
          createdOn: now,
          updatedOn: now,
          name: 'Unknown Pilot',
          unknownPilot: true,
        } as Pilot);

        // Set unknown pilot as the default selection.
        dispatch(saveSelectedPilot({ pilotId: unknownPilot._id.toString() }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pilot]);
};
