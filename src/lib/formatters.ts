import { Duration } from "luxon";

// Masks the given number directly into the format 'h:mm:ss'. Fewer than
// 6 numeric digits are padded with '0'.
// Example, 123456 is output as '12:34:56'.
export const maskToHMS = (value: number) => {
  return value.toString().padStart(6, '0').split(/(?=(?:..)*$)/).join(':');
};

// Converts as masked number to equivalent number of seconds.
// Example, 123456 is 12hr, 34min, 56sec = 45926sec.
export const hmsMaskToSeconds = (mask?: string) => {
  if (!mask) return 0;
  const parts = maskToHMS(parseInt(mask)).split(':');
  return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
};

// Converts minutes and seconds to seconds.
export const MSSToSeconds = (value: number | string) => {
  let v = typeof value === 'string' ? parseFloat(value) : value;
  const m = Math.trunc(v);
  const s = (v - m) * 100;
  return Math.trunc((m * 60) + s);
};

// Converts seconds to minutes and seconds where the places after the decimal are seconds.
// Format defaults to 'm.ss' for use in ListItemInput component value.
export const secondsToMSS = (value?: number | string, opts?: {format: string}) => {
  let v = typeof value === 'string' ? parseFloat(value) : value;
  const duration = Duration.fromObject({ seconds: v });
  const format = opts?.format || 'm.ss';
  return duration.toFormat(format);
};
