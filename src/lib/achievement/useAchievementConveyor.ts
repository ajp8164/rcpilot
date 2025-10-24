import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { useObject, useQuery, useRealm } from '@realm/react';
import { eventKind } from 'lib/modelEvent';
import { displayNotification } from 'lib/notifications';
import lodash from 'lodash';
import { DateTime } from 'luxon';
import { BSON } from 'realm';
import { Achievement, Commander } from 'realmdb/Commander';
import { Event } from 'realmdb/Event';
import { selectCommander } from 'store/selectors/commanderSelectors';

import { achievementConfig } from './index';

export const useAchievementConveyor = () => {
  const realm = useRealm();
  const _commander = useSelector(selectCommander);
  const commander = useObject(
    Commander,
    new BSON.ObjectId(_commander.commanderId),
  );

  const commanderEvents = useQuery(
    Event,
    events => {
      return events
        .filtered(`commander._id == $0`, commander?._id)
        .sorted('createdOn', true);
    },
    [commander],
  );

  useEffect(() => {
    if (!commander) return;

    // The most recent event is sorted to the first index.
    const commanderEvent = commanderEvents[0];
    if (!commanderEvent) return;

    Object.keys(achievementConfig).forEach(name => {
      let qualifies = 0;
      achievementConfig[name].criteria.forEach(prop => {
        switch (prop.op) {
          case '=':
            if (lodash.get(commanderEvent, prop.path) === prop.value) {
              qualifies++;
            }
            break;
          case '>=':
            if (lodash.get(commanderEvent, prop.path) >= prop.value) {
              qualifies++;
            }
            break;
          case '<=':
            if (lodash.get(commanderEvent, prop.path) <= prop.value) {
              qualifies++;
            }
            break;
        }
      });

      // Must have met all of the criteria.
      if (qualifies === achievementConfig[name].criteria.length) {
        const alreadyAwarded = commander?.achievements.find(
          ac => ac.name === name,
        );
        if (!alreadyAwarded) {
          // Award the achievement.
          const achievement = {
            date: DateTime.now().toISO(),
            name,
            event: commanderEvent,
          } as Achievement;

          realm.write(() => {
            commander?.achievements.push(achievement);
          });

          // Send an app location notification.
          const displayName = name.replace(
            '{Event}',
            eventKind(commanderEvent.model?.type).name,
          );
          displayNotification({
            title: `${displayName} for ${commanderEvent.commander?.name}`,
            description: `Congratulations! You've earned the '${displayName}' achievement with ${commanderEvent.model?.name}.`,
          });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commander, commanderEvents]);
};
