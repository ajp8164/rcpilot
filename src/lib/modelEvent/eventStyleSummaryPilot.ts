import { secondsToFormat } from 'lib/formatters';

export type EventStyleStatistics = {
  eventStyleName: string;
  count: number;
  duration: number;
};

export const eventStyleSummaryPilot = (
  eventStyleStatistics: EventStyleStatistics,
) => {
  let time = secondsToFormat(eventStyleStatistics.duration, {
    format: "h'h' m'm'",
  });

  time = time.replace(/^0h /g, ''); // Remove zero values
  time = time.replace(' 0m', '');
  const events = `${eventStyleStatistics.count} event${eventStyleStatistics.count !== 1 ? 's' : ''}`;

  return `${time}, ${events}`;
};
