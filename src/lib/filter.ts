import { FilterRelation, FilterState } from 'components/molecules/filters';

import { DateTime } from 'luxon';
import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { ellipsis } from '@react-native-ajp-elements/core';
import lodash from 'lodash';

export const filterSummary = (filterOrFilterType: Filter | string) => {
  let filterType: string;
  let filter: Filter | undefined = undefined;

  if (typeof filterOrFilterType === 'string') {
    filterType = filterOrFilterType;
  } else {
    filter = filterOrFilterType;
    filterType = filter?.type;
  }

  const kind =
    filterType === FilterType.ModelsFilter ? 'models' :
    filterType === FilterType.BatteriesFilter ? 'batteries' :
    filterType === FilterType.ReportEventsFilter ? 'events' :
    filterType === FilterType.ReportMaintenanceFilter ? 'maintenance items' :
    filterType === FilterType.ReportModelScanCodesFilter ? 'models' :
    filterType === FilterType.ReportBatteryScanCodesFilter ? 'batteries' : '';

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
        // Checking filter here to satisfy the 'keyof typeof' type cast.
      s += filter ? `${filterStateSummary(property, filter!.values[property as keyof typeof filter.values])}` : '';
    });
    return `Matches ${kind} where ${s}.`;
  }
};

// Filter values with labels default as a suffix. However, if the label is in
// this array then it will be output as a prefix instead.
const prefixes = ['$'];

// Generally, filter values are stored in the filter state 'value' array at index 0.
// There are a few exceptions as noted in this implementation. For example, number values
// allow a label to appear in the 'value' array at index 1.
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
        s = `${p} in past ${state.value[0]} ${state.value[1]}`; // [0] is number [1] is time span
        break;
      case FilterRelation.Contains:
        s = `${p} contains ${ellipsis(state.value[0], 10)}`;
        break;
      case FilterRelation.Missing:
        s = `${p} does not contain ${ellipsis(state.value[0], 10)}`;
        break;
      case FilterRelation.EQ:
        if (prefixes.includes(state.value[1])) {
          s = `${p} is ${state.value[1]}${state.value[0]}`; // [0] is number [1] is label if exists
        } else {
          s = `${p} is ${state.value[0]} ${state.value[1]}`; // [0] is number [1] is label if exists
        }
        break;
      case FilterRelation.GT:
        if (prefixes.includes(state.value[1])) {
          s = `${p} is more than ${state.value[1]}${state.value[0]}`; // [0] is number [1] is label if exists
        } else {
          s = `${p} is more than ${state.value[0]} ${state.value[1]}`; // [0] is number [1] is label if exists
        }
        break;
      case FilterRelation.LT:
        if (prefixes.includes(state.value[1])) {
          s = `${p} is less than ${state.value[1]}${state.value[0]}`; // [0] is number [1] is label if exists
        } else {
          s = `${p} is less than ${state.value[0]} ${state.value[1]}`; // [0] is number [1] is label if exists
        }
        break;
      case FilterRelation.NE:
        if (prefixes.includes(state.value[1])) {
          s = `${p} is not ${state.value[1]}${state.value[0]}`; // [0] is number [1] is label if exists
        } else {
          s = `${p} is not ${state.value[0]} ${state.value[1]}`; // [0] is number [1] is label if exists
        }
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
