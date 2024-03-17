import { Duration } from "luxon";

// Converts seconds to minutes and seconds where the places after the decimal are seconds.
// Format defaults to 'm.ss' for use in ListItemInput component value.
export const secondsToMSS = (value?: number | string, opts?: {format: string}) => {
  let v = typeof value === 'string' ? parseFloat(value) : value;
  const duration = Duration.fromObject({ seconds: v });
  const format = opts?.format || 'm.ss';
  return duration.toFormat(format);
};
