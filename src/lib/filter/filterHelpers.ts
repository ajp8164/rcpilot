import { DateFilterState, DateRelation } from 'components/molecules/filters';

import { DateTime } from 'luxon';
import { TimeSpan } from 'types/common';

export const getDate = (filterState: DateFilterState) => {
  let date = DateTime.fromISO(filterState.value[0]).toUnixInteger().toString();
  if (filterState.relation === DateRelation.Past) {
    const num = parseInt(filterState.value[0], 10);
    const timeframe = filterState.value[1];
    let days = num;
    switch (timeframe) {
      case TimeSpan.Weeks:
        days = num * 7;
        break;
      case TimeSpan.Months:
        days = num * 30;
        break;
      case TimeSpan.Years:
        days = num * 365;
        break;
    }
    date = DateTime.now().minus({ days }).toUnixInteger().toString();
  }
  return date;
};
