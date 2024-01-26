import { FilterRelation, FilterState } from 'components/molecules/filters';

import { DateTime } from 'luxon';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { ellipsis } from '@react-native-ajp-elements/core';
import lodash from 'lodash';

export const filterSummary = (filter?: Filter) => {
  const kind =
    filter?.type === FilterType.ModelsFilter ? 'models' :
    filter?.type === FilterType.BatteriesFilter ? 'batteries' :
    filter?.type === FilterType.ReportEventsFilter ? 'events' :
    filter?.type === FilterType.ReportMaintenanceFilter ? 'maintenance items' :
    filter?.type === FilterType.ReportModelScanCodesFilter ? 'models' :
    filter?.type === FilterType.ReportBatteryScanCodesFilter ? 'batteries' : '';

  if (!filter) {
    return `Matches all ${kind}`;
  } else {
    let s = '';
    const filterValues = Object.keys(filter.values);
    filterValues.forEach((property, index) => {
      s.length > 0 ? 
        index === filterValues.length - 1 ?
        s += ', and ' :
        s += ', ' :
        null;
      s += `${filterStateSummary(property, filter.values[property as keyof typeof filter.values])}`;
    });
    return `Matches ${kind} where ${s}.`;
  }
};

export const filterStateSummary = (property: string, state: FilterState) => {
  let p = lodash.startCase(property).toLowerCase();
  let s = `any ${p}`;
  if (state.relation !== FilterRelation.Any && state.value) {
    switch (state.relation) {
      case FilterRelation.After:
        s = `${p} is after ${DateTime.fromISO(state.value[0]).toFormat('d/MM/yy')}`;
        break;
      case FilterRelation.After:
        s = `${p} is after ${DateTime.fromISO(state.value[0]).toFormat('d/MM/yy')}`;
        break;
      case FilterRelation.Before:
        s = `${p} is before ${DateTime.fromISO(state.value[0]).toFormat('d/MM/yy')}`;
        break;
      case FilterRelation.Past:
        s = `${p} in past ${state.value[0]} ${state.value[1]}`;
        break;
      case FilterRelation.Contains:
        s = `${p} contains ${ellipsis(state.value[0], 10)}`;
        break;
      case FilterRelation.Missing:
        s = `${p} does not contain ${ellipsis(state.value[0], 10)}`;
        break;
      case FilterRelation.EQ:
        s = `${p} is ${state.value}`;
        break;
      case FilterRelation.GT:
        s = `${p} is more than ${state.value}`;
        break;
      case FilterRelation.LT:
        s = `${p} is less than ${state.value}`;
        break;
      case FilterRelation.NE:
        s = `${p} is not ${state.value}`;
        break;
      case FilterRelation.Is:
        s = `${p} is any of ${state.value.length} items`;
        break;
      case FilterRelation.IsNot:
        s = `${p} is not any of ${state.value.length} items`;
        break;
      case FilterRelation.No:
        s = `without ${p}`;
        break;
      case FilterRelation.Yes:
        s = `with ${p}`;
        break;
    }
  }
  return s;
};
