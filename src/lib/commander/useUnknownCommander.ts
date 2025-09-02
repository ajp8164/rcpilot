import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useQuery, useRealm } from '@realm/react';
import { DateTime } from 'luxon';
import { Commander } from 'realmdb/Commander';
import { saveSelectedCommander } from 'store/slices/commander';

export const useUnknownCommander = () => {
  const dispatch = useDispatch();
  const realm = useRealm();

  const commander = useQuery(Commander, commanders =>
    commanders.filtered('unknownCommander == true'),
  );

  useEffect(() => {
    if (!commander.length) {
      // Lazily create the unknown commander.
      realm.write(() => {
        const now = DateTime.now().toISO();
        const unknownCommander = realm.create('Commander', {
          createdOn: now,
          updatedOn: now,
          name: 'Unknown Commander',
          unknownCommander: true,
        } as Commander);

        // Set unknown commander as the default selection.
        dispatch(
          saveSelectedCommander({
            commanderId: unknownCommander._id.toString(),
          }),
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commander]);
};
