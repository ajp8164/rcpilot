import { Achievement, Pilot } from "realmdb/Pilot";
import { useObject, useQuery, useRealm } from "@realm/react";

import { BSON } from "realm";
import { DateTime } from "luxon";
import { Event } from "realmdb/Event";
import { achievementConfig } from ".";
import { displayNotification } from "lib/notifications";
import { eventKind } from 'lib/event';
import lodash from "lodash";
import { selectPilot } from "store/selectors/pilotSelectors";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export const useAchievementConveyor = () => {
  const realm = useRealm();
  const _pilot = useSelector(selectPilot);
  const pilot = useObject(Pilot, new BSON.ObjectId(_pilot.pilotId));

  const pilotEvents = useQuery(Event, events => {
    return events.filtered('pilot._id == $0', pilot?._id).sorted('createdOn', true)
  }, [ pilot ]);

  useEffect(() => {
    if (!pilot) return;
    
    // The most recent event is sorted to the first index.
    const pilotEvent = pilotEvents[0];

    pilotEvent && Object.keys(achievementConfig).forEach(name => {
      let qualifies = 0;
      achievementConfig[name].criteria.forEach(prop => {
        switch (prop.op) {
          case '=': if (lodash.get(pilotEvent, prop.path) === prop.value) { qualifies++ }; break;
          case '>=': if (lodash.get(pilotEvent, prop.path) >= prop.value) { qualifies++ }; break;
          case '<=': if (lodash.get(pilotEvent, prop.path) <= prop.value) { qualifies++ }; break;
        }
      });

      // Must have met all of the criteria.
      if (qualifies === achievementConfig[name].criteria.length) {
        const alreadyAwarded = pilot?.achievements.find(ac => ac.name === name);
        if (!alreadyAwarded) {
          // Award the achievement.
          const achievement = {
            date: DateTime.now().toISO(),
            name,
            event: pilotEvent,
          } as Achievement;

          realm.write(() => {
            pilot?.achievements.push(achievement)
          });

          // Send an app location notification.
          const displayName = name.replace('{Event}', eventKind(pilotEvent.model?.type).name);
          displayNotification({
            title: `${displayName} for ${pilotEvent.pilot?.name}`,
            description: `Congratulations! You've earned the '${displayName}' achievement with ${pilotEvent.model?.name}.`,
          });
        }
      }
    });
  }, [ pilot, pilotEvents ]);
};
