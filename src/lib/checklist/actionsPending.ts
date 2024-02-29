import { ChecklistActionNonRepeatingScheduleTimeframe, ChecklistActionScheduleType, ChecklistType } from 'types/checklist';

import { DateTime } from 'luxon';
import { JChecklistAction } from 'realmdb/Checklist';
import { Model } from 'realmdb/Model';

export const actionsPending = (model: Model, checklistType: ChecklistType) => {

  const checklists = model?.checklists.filter(c => {
    return c.type === checklistType;
  });

  checklists.forEach(c => {
    c.actions.forEach(a => {
      let due: Due;
      if (a.schedule.type === ChecklistActionScheduleType.NonRepeating) {
        due = checkNonRepeatingAction(a, model);
      } else {
        due = checkRepeatingAction(a, model);
      }
    });
  });

  return checklists;
};

type Due = 'now' | 'past';

const checkRepeatingAction = (action: JChecklistAction, model: Model) => {
  let due: Due = 'now';
  return due;
};

const checkNonRepeatingAction = (action: JChecklistAction, model: Model) => {
  let due: Due = 'now';

  if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.Today) {
    due = 'now';
  } else {
    // MODEL MINUTES
    if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.ModelMinutes) {
      if (action.schedule.following !== undefined) {
        const estTime = parseInt(action.schedule.following) - model.totalTime;
        if (estTime === 0 ) {
          due = 'now';
        } else if (estTime < 0) {
          due = 'past';
        }
      }

    // EVENTS
    } else if (action.schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.Events) {
      if (action.schedule.following !== undefined) {
        const estEvents = parseInt(action.schedule.following) - model.totalEvents;
        if (estEvents === 0) {
          due = 'now';
        } else if (estEvents < 0) {
          due = 'past';
        }
      }

    // DATE
    }  else {
      if (action.schedule.following !== undefined) {
        let daysInFuture = action.schedule.value;
        switch (action.schedule.period) {
          case 'Weeks':
            daysInFuture = action.schedule.value * 7;
            break;
          case 'Months':
            daysInFuture = action.schedule.value * 30;
            break;
        }
        const date = DateTime.fromISO(action.schedule.following);
        const days = Math.trunc(DateTime.now().plus({days: daysInFuture}).diff(date, 'days').days);
        if (days === 0) {
          due = 'now';
        } else if (days < 0) {
          due = 'past';
        }
      }
    }
  };

  return due;
};
