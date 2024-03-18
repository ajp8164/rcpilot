import { Filter } from 'realmdb/Filter';
import { FilterType } from 'types/filter';
import { filterSummaryState } from '.';

export const filterSummary = (filterOrFilterType: Filter | string) => {
  let filterType: string;
  let filter: Filter | undefined;

  if (typeof filterOrFilterType === 'string') {
    filterType = filterOrFilterType;
  } else {
    filter = filterOrFilterType;
    filterType = filter?.type;
  }

  const kind =
    filterType === FilterType.BatteriesFilter
      ? 'batteries'
      : filterType === FilterType.BatteryCyclesFilter
        ? 'battery cycles'
        : filterType === FilterType.EventsModelFilter
          ? 'events'
          : filterType === FilterType.MaintenanceFilter
            ? 'logs'
            : filterType === FilterType.ModelsFilter
              ? 'models'
              : filterType === FilterType.ReportEventsFilter
                ? 'events'
                : filterType === FilterType.ReportMaintenanceFilter
                  ? 'maintenance items'
                  : filterType === FilterType.ReportModelScanCodesFilter
                    ? 'models'
                    : filterType === FilterType.ReportBatteryScanCodesFilter
                      ? 'batteries'
                      : '';

  if (!filter) {
    return `Matches all ${kind}`;
  } else {
    let s = '';
    const filterValues = Object.keys(filter.values);
    filterValues.forEach((property, index) => {
      s.length > 0 ? (index === filterValues.length - 1 ? (s += ', and ') : (s += ', ')) : null;
      // Checking filter here to satisfy the 'keyof typeof' type cast.
      s += filter
        ? `${filterSummaryState(property, filter.values[property as keyof typeof filter.values])}`
        : '';
    });
    return `Matches ${kind} where ${s}.`;
  }
};
