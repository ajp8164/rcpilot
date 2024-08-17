import { secondsToFormat } from 'lib/formatters';

export type EventStyleStatistics = {
  eventStyleName: string;
  count: number;
  duration: number;
};

export const eventStyleSummaryPilot = (eventStyleStatistics: EventStyleStatistics) => {
  const time = `${secondsToFormat(eventStyleStatistics.duration, { format: 'm:ss' })}`;
  const count = `${eventStyleStatistics.count} event${eventStyleStatistics.count !== 1 ? 's' : ''}`;
  return `${time}, ${count}`;
};
