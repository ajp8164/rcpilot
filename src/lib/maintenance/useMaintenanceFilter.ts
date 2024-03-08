import { Checklist, ChecklistAction, ChecklistActionHistoryEntry } from 'realmdb/Checklist';
import {
  DateRelation,
  NumberRelation,
  StringRelation
} from 'components/molecules/filters';

import { BSON } from 'realm';
import { ChecklistType } from 'types/checklist';
import { DateTime } from 'luxon';
import { Filter } from 'realmdb/Filter';
import { Model } from 'realmdb/Model';
import { TimeSpan } from 'types/common';
import { selectFilters } from 'store/selectors/filterSelectors';
import { useObject } from '@realm/react';
import { useSelector } from 'react-redux';

export type HistoryEntry = {
  checklist: Checklist;
  action: ChecklistAction,
  history: ChecklistActionHistoryEntry,
};

export const useMaintenanceFilter = (modelId: string) => {
  const filterId = useSelector(selectFilters).maintenanceFilterId;
  const filter = useObject(Filter, new BSON.ObjectId(filterId))?.values;
  const model = useObject(Model, new BSON.ObjectId(modelId));

  let entries: HistoryEntry[] = [];
  const maintenanceChecklists = model?.checklists.filter(c =>
    c.type === ChecklistType.Maintenance || c.type === ChecklistType.OneTimeMaintenance
  );
  maintenanceChecklists?.forEach(c => {
    c.actions.forEach(a => {
      a.history.forEach(h => {
        entries.push({
          checklist: c,
          action: a,
          history: h,
        } as HistoryEntry);
      });
    });
  });

  entries.sort((a, b) => {
    return (a.history.date > b.history.date) ? -1 : ((a.history.date < b.history.date) ? 1 : 0)
  })

  if (!filter) return entries;

  let date = DateTime.fromISO(filter.date.value[0]).toUnixInteger().toString();
  if (filter.date.relation === DateRelation.Past) {
    const num = parseInt(filter.date.value[0]);
    const timeframe = filter.date.value[1]; 
    let days = num;
    switch (timeframe) {
      case TimeSpan.Weeks: days = num * 7; break;
      case TimeSpan.Months: days = num * 30; break;
      case TimeSpan.Years: days = num * 365; break;
    }
    date = DateTime.now().minus({days}).toUnixInteger().toString();
  }

  entries = entries.filter(e => {
    switch (filter.date.relation) {
      case DateRelation.After:
      case DateRelation.Past:
        return e.history.date > date;
      case DateRelation.Before:
        return e.history.date < date;
    }
    return true;
  });

  entries = entries.filter(e => {
    if (!e.history.cost && filter.costs.relation === NumberRelation.Any) return true;
    if (!e.history.cost) return false;
    switch (filter.costs.relation) {
      case NumberRelation.LT:
        return e.history.cost > parseFloat(filter.costs.value[0]);
      case NumberRelation.GT:
        return e.history.cost > parseFloat(filter.costs.value[0]);
      case NumberRelation.EQ:
        return e.history.cost > parseFloat(filter.costs.value[0]);
      case NumberRelation.NE:
        return e.history.cost > parseFloat(filter.costs.value[0]);
    }
    return true;
  });

  entries = entries.filter(e => {
    switch (filter.notes.relation) {
      case StringRelation.Contains:
        return e.action.notes?.includes(filter.notes.value[0]);
      case StringRelation.Missing:
        return !e.action.notes?.includes(filter.notes.value[0]);
    }
    return true;
  });

  return entries;
};
