import {
  ChecklistActionNonRepeatingScheduleTimeframe,
  ChecklistActionRepeatingScheduleFrequency,
  ChecklistActionScheduleType,
  ChecklistType
} from 'types/checklist';
import {
  ChecklistActionScheduleState,
  JChecklistActionHistoryEntry,
  JChecklistActionSchedule,
  JChecklistActionScheduleDue
} from 'realmdb/Checklist';

import { DateTime } from "luxon";
import { Model } from "realmdb/Model";
import { eventKind } from 'lib/event';
import { secondsToMSS } from "lib/formatters";

export const actionScheduleState = (
  schedule: JChecklistActionSchedule,
  checklistType: ChecklistType,
  history: JChecklistActionHistoryEntry[],
  model?: Model,
) => {
  if (schedule.type === ChecklistActionScheduleType.Repeating) {
    return actionRepeatingScheduleState(schedule, checklistType, history, model);
  } else {
    return actionNonRepeatingScheduleState(schedule, checklistType, history, model);
  }
};

function actionRepeatingScheduleState(
  schedule: JChecklistActionSchedule,
  checklistType: ChecklistType,
  history: JChecklistActionHistoryEntry[],
  model?: Model
) {
  let when = '';
  let times = '';
  let freq = '';
  let due: JChecklistActionScheduleDue = {value: 0, units: 'days', now: true};

  if (schedule.period === ChecklistActionRepeatingScheduleFrequency.ModelMinutes) {
    times = schedule.value.toString();
    freq = ` minute${schedule.value === 1 ? '' : 's'} of model time`;
  } else {
    if (schedule.value === 1) {
      times = '';
      freq = schedule.period.toLowerCase().replace(/s$/, '');
    } else {
      times = `${schedule.value} `;
      freq = schedule.period.toLowerCase();
    }
    if (schedule.period !== ChecklistActionRepeatingScheduleFrequency.Events) {
      freq += ' of calendar time';
    }
  }

  if (checklistType === ChecklistType.PreEvent) {
    when = 'before every';
  } else {
    when = 'after every';
  }

  // When there is a model repeating actions are due periodically. Use history to determine whether
  // the action is again due.
  if (model) {
    let lastPerformed;

    switch (schedule.period) {
      case 'Events':
        // EVENTS
        lastPerformed = history && history[history.length - 1].eventNumber;
        const eventsSinceLastPerformed = model.totalEvents - lastPerformed;

        if (eventsSinceLastPerformed >= schedule.value) {
          // Action is due
          const eventsPastDue = schedule.value - eventsSinceLastPerformed;
          due = {value: eventsPastDue, units: 'events', now: true};
        } else {
          // Action is not due
          const targetEvent = eventsSinceLastPerformed + schedule.value;
          const estEvents = targetEvent - model.totalEvents;
          due = {value: estEvents, units: 'events', now: false};
        }
        break;

      case 'ModelMinutes':
        // MODEL MINUTES
        lastPerformed = history && history[history.length - 1].modelTime;
        const minutesSinceLastPerformed = model.totalTime - lastPerformed;

        if (minutesSinceLastPerformed >= schedule.value) {
          // Action is due
          const minutesPastDue = schedule.value - minutesSinceLastPerformed;
          const modelAverageEventDuration = model.totalTime / model.totalEvents;
          const estEvents = (minutesPastDue * 60) / modelAverageEventDuration;
          due = {value: estEvents, units: 'events', now: true};
        } else {
          // Action is not due
          const modelAverageEventDuration = model.totalTime / model.totalEvents;
          const estEvents = modelAverageEventDuration / (minutesSinceLastPerformed * 60);
          due = {value: estEvents, units: 'events', now: false};
        }
        break;
        
      default:
        // DATE
        lastPerformed = history.length && DateTime.fromISO(history[history.length - 1].date);

        if (lastPerformed) {
          let valueInDays = schedule.value;
          switch (schedule.period) {
            case 'Weeks': valueInDays = schedule.value * 7; break;
            case 'Months': valueInDays = schedule.value * 30; break;
          };

          const targetDate = lastPerformed.plus({days: valueInDays});
          const days = Math.round(targetDate.diff(DateTime.now(), 'days').days);

          if (days <= 0) {
            due = {value: days, units: 'days', now: true};
          } else {
            due = {value: days, units: 'days', now: false};
          }
        } else {
          due = {value: 0, units: 'days', now: true};
        }
        break;
    }
  }

  return {
    due,
    text: `Perform ${when} ${times}${freq}`,
  } as ChecklistActionScheduleState;
};

function actionNonRepeatingScheduleState (
  schedule: JChecklistActionSchedule,
  _checklistType: ChecklistType,
  history: JChecklistActionHistoryEntry[],
  model?: Model,
) {
  let after = '';
  let value = '';
  let timeframe = '';
  let dueStr = '';
  let due: JChecklistActionScheduleDue = {value: 0, units: 'days', now: true};

  // TODAY
  if (schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.Today) {
    value = '';
    timeframe = '';
    after = schedule.following ? 'immediately' : 'immediatley at install';
    dueStr = schedule.following ? 'Due now' : '';
    due = {value: 0, units: 'days', now: true};

  } else {
    value = `${schedule.value} `;
    timeframe = schedule.period.replace('Events', eventKind(model?.type).namePlural.toLowerCase());
    timeframe = schedule.value === 1 ? timeframe.replace(/s$/, '') : timeframe;
    timeframe = timeframe.toLowerCase();

    // MODEL MINUTES
    if (schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.ModelMinutes) {
      timeframe = 'minutes';
      timeframe = schedule.value === 1 ? timeframe.replace(/s$/, '') : timeframe;

      if (model && schedule.following !== undefined) {
        after = ` after ${eventKind(model.type).name.toLowerCase()} time ${secondsToMSS(schedule.following, {format: 'm:ss'})}`;

        const targetMinute = parseInt(schedule.following) + schedule.value;
        const estMinutes = targetMinute - Math.trunc(model.totalTime / 60);

        if (estMinutes === 0 ) {
          dueStr = 'Due today';
          due = {value: 0, units: 'days', now: true};
        } else if (estMinutes < 0) {
          const modelAverageEventDuration = model.totalTime / model.totalEvents;
          const estEvents = modelAverageEventDuration / (estMinutes * 60);

          dueStr = `Past due by about ${Math.abs(estEvents)} ${eventKind(model.type).namePlural.toLowerCase()}`;
          dueStr = estMinutes === 1 ? dueStr.replace(/s$/, '') : dueStr;
          due = {value: estEvents, units: 'days', now: true};
        } else {
          let estEvents = 0;
          const modelAverageEventDuration = model.totalTime / model.totalEvents;

          if (modelAverageEventDuration) {
            estEvents = modelAverageEventDuration / parseInt(schedule.following);
          }

          if (estEvents === 0) {
            dueStr = `Due in several ${eventKind(model.type).namePlural.toLowerCase()}`;
            // No due object since its not definitive
          } else {
            dueStr = `Due in about ${estEvents} ${eventKind(model.type).namePlural.toLowerCase()}`;
            dueStr = estMinutes === 1 ? dueStr.replace(/s$/, '') : dueStr;
            due = {value: estEvents, units: 'events', now: false};
          }
        }
      } else {
        after = ' after total model time at install';
      }

    // EVENTS
    } else if (schedule.period === ChecklistActionNonRepeatingScheduleTimeframe.Events) {
      if (model && schedule.following !== undefined) {
        after = ` after ${eventKind(model?.type).name.toLowerCase()} #${schedule.following}`;

        const targetEvent = parseInt(schedule.following) + schedule.value;
        const estEvents = targetEvent - model.totalEvents;

        if (estEvents === 0) {
          dueStr = 'Due today';
          due = {value: 0, units: 'events', now: true};
        } else if (estEvents < 0) {
          dueStr = `Past due by ${Math.abs(estEvents)} ${eventKind(model.type).namePlural}`;
          dueStr = Math.abs(estEvents) === 1 ? dueStr.replace(/s$/, '') : dueStr;
          due = {value: estEvents, units: 'events', now: true};
        } else {
          dueStr = `Due in ${estEvents} ${eventKind(model.type).namePlural.toLowerCase()}`;
          dueStr = Math.abs(estEvents) === 1 ? dueStr.replace(/s$/, '') : dueStr;
          due = {value: estEvents, units: 'events', now: false};
        }
 
      } else {
        after = ` after total ${eventKind(model?.type).namePlural.toLowerCase()} at install`;
      }

    // DATE
    }  else {
      if (model && schedule.following !== undefined) {
        const date = DateTime.fromISO(schedule.following);
        after = ` after ${date.toFormat('M/d/yyyy')}`;

        let valueInDays = schedule.value;
        switch (schedule.period) {
          case 'Weeks': valueInDays = schedule.value * 7; break;
          case 'Months': valueInDays = schedule.value * 30; break;
        };

        const targetDate = date.plus({days: valueInDays});
        const days = Math.round(targetDate.diff(DateTime.now(), 'days').days);
        
        if (days === 0) {
          dueStr = 'Due today';
          due = {value: 0, units: 'days', now: true};
        } else if (days < 0) {
          dueStr = `Past due by ${Math.abs(days)} days`;
          dueStr = Math.abs(days) === 1 ? dueStr.replace(/s$/, '') : dueStr;
          due = {value: days, units: 'days', now: true};
        } else {
          dueStr = `Due in about ${days} days`;
          dueStr = days === 1 ? dueStr.replace(/s$/, '') : dueStr;
          due = {value: days, units: 'days', now: false};
        }
      } else {
        after = ' after date at install';
      }
    }
  }

  // Non-repeating items with history are complete.
  if (history.length > 0) {
    dueStr = 'Has already been performed';
  }

  return {
    due,
    text: `Perform once ${value}${timeframe}${after}${dueStr ? '\n' + dueStr : ''}`,
  } as ChecklistActionScheduleState;
};
