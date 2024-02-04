// Masks the given number directly into the format 'hh:mm:ss'. Fewer than
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
