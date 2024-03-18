import { FilterRelation, FilterState } from 'components/molecules/filters';

import { DateTime } from 'luxon';
import { ellipsis } from '@react-native-ajp-elements/core';
import lodash from 'lodash';

// Filter values with labels default as a suffix. However, if the label is in
// this array then it will be output as a prefix instead.
const prefixes = ['$'];

// Generally, filter values are stored in the filter state 'value' array at index 0.
// There are a few exceptions as noted in this implementation. For example, number values
// allow a label to appear in the 'value' array at index 1.
export const filterSummaryState = (property: string, state: FilterState) => {
  // This causes a one character first "word" to be forced to uppercase (e.g. cRating => C rating).
  let p = lodash.startCase(property).toLowerCase();
  if (p[1] === ' ') {
    p = `${p[0].toUpperCase()}${p.substring(1)}`;
  }
  let s = `any ${p}`;
  if (state.relation !== FilterRelation.Any && state.value) {
    switch (state.relation) {
      case FilterRelation.After:
        s = `${p} is after ${DateTime.fromISO(state.value[0]).toFormat('M/d/yy')}`;
        break;
      case FilterRelation.Before:
        s = `${p} is before ${DateTime.fromISO(state.value[0]).toFormat('M/d/yy')}`;
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
