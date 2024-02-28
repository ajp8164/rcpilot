import { ChecklistActionNonRepeatingScheduleTimeframe, ChecklistActionRepeatingScheduleFrequency, ChecklistActionScheduleType, ChecklistType } from "types/checklist";

import { BSON } from "realm";
import { DateTime } from "luxon";
import { JChecklistAction } from 'realmdb/Checklist';
import { Model } from "realmdb/Model";
import { eventKind } from 'lib/event';
import { secondsToMSS } from "lib/formatters";
import { useObject } from "@realm/react";

export const useActionScheduleSummary = (modelId?: string) => {
  const model = useObject(Model, new BSON.ObjectId(modelId));

  return (
    action: JChecklistAction,
    checklistType: ChecklistType,
  ) => {
    let result = '';
    if (action.schedule.type === ChecklistActionScheduleType.Repeating) {
      let when = '';
      let times = '';
      let freq = '';
  
      if (action.schedule.period === ChecklistActionRepeatingScheduleFrequency.ModelMinutes) {
        times = action.schedule.value.toString();
        freq = ` minute${action.schedule.value === 1 ? '' : 's'} of model time`;
      } else {
        if (action.schedule.value === 1) {
          times = '';
          freq = action.schedule.period.toLowerCase().replace(/s$/, '');
        } else {
          times = `${action.schedule.value} `;
          freq = action.schedule.period.toLowerCase();
        }
  
        if (action.schedule.period !== ChecklistActionRepeatingScheduleFrequency.Events) {
          freq += ' of calendar time';
        }
      }
  
      if (checklistType === ChecklistType.PreEvent) {
        when = 'before every';
      } else {
        when = 'after every';
      }
      result = `Perform ${when} ${times}${freq}`;
    } else {
      let after = '';
      let value = '';
      let timeframe = '';
      let due = '';
  
      if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.Today) {
        value = '';
        timeframe = '';
        after = action.schedule.following ? 'immediately' : 'immediatley at install';
        due = action.schedule.following ? 'Due now' : '';
      } else {
        value = `${action.schedule.value} `;
        timeframe = action.schedule.period.replace('Events', eventKind(model?.type).namePlural.toLowerCase());
        timeframe = action.schedule.value === 1 ? timeframe.replace(/s$/, '') : timeframe;
        timeframe = timeframe.toLowerCase();
  
        // MODEL MINUTES
        if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.ModelMinutes) {
          timeframe = 'minutes';
          timeframe = action.schedule.value === 1 ? timeframe.replace(/s$/, '') : timeframe;

          if (model && action.schedule.following !== undefined) {
            let estEvents = parseInt(action.schedule.following);
            if (model?.stats.averageEventDuration) {
              estEvents = model?.stats.averageEventDuration / parseInt(action.schedule.following);
            }
            after = ` after ${eventKind(model.type).name.toLowerCase()} time ${secondsToMSS(action.schedule.following, {format: 'm:ss'})}`;

            const estTime = parseInt(action.schedule.following) - model.stats.totalTime;
            if (estTime === 0 ) {
              due = 'Due today';
            } else if (estTime < 0) {
              due = `Past due by about ${Math.trunc(estTime / 60)} minutes`;
              due = estTime === 1 ? due.replace(/s$/, '') : due;
            } else {
              due = `Due in about ${estEvents} ${eventKind(model.type).namePlural.toLowerCase()}`;
              due = estTime === 1 ? due.replace(/s$/, '') : due;
            }
          } else {
            after = ' after total model time at install';
          }

        // EVENTS
        } else if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.Events) {
          if (model && action.schedule.following !== undefined) {
            after = ` after ${eventKind(model?.type).name.toLowerCase()} #${action.schedule.following}`;

            const estEvents = parseInt(action.schedule.following) - model.stats.totalEvents;
            if (estEvents === 0) {
              due = 'Due today';
            } else if (estEvents < 0) {
              due = `Past due by ${Math.abs(estEvents)} ${eventKind(model.type).namePlural}`;
              due = Math.abs(estEvents) === 1 ? due.replace(/s$/, '') : due;
            } else {
              due = `Due in ${estEvents} ${eventKind(model.type).namePlural.toLowerCase()}`;
              due = Math.abs(estEvents) === 1 ? due.replace(/s$/, '') : due;
            }
          } else {
            after = ` after total ${eventKind(model?.type).namePlural.toLowerCase()} at install`;
          }

        // DATE
        }  else {
          if (model && action.schedule.following !== undefined) {
            const date = DateTime.fromISO(action.schedule.following);
            after = ` after ${date.toFormat('M/d/yyyy')}`;

            const days = Math.trunc(DateTime.now().diff(date, 'days').days);
            if (days === 0) {
              due = 'Due today';
            } else if (days < 0) {
              due = `Past due by ${Math.abs(days)} days`;
            } else {
              due = `Due in about ${days} days`;
            }
          } else {
            after = ' after date at install';
          }
        }
      }
      result = `Perform once ${value}${timeframe}${after}${due ? '\n' + due : ''}`;
    }
    return result;
  };
};
