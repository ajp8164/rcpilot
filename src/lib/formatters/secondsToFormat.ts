import { Duration } from 'luxon';

// Converts seconds to any luxon duration format.
// Format defaults to 'm.ss' for use in ListItemInput component value.
export const secondsToFormat = (value?: number | string, opts?: { format: string }) => {
  const v = typeof value === 'string' ? parseFloat(value) : value;
  const duration = Duration.fromObject({ seconds: v });
  const format = opts?.format || 'm.ss';
  return duration.toFormat(format);
};
