// Masks the given number directly into the format 'h:mm:ss'. Fewer than
// 6 numeric digits are padded with '0'.
// Example, 123456 is output as '12:34:56'.
export const maskToHMS = (value: number) => {
  return value.toString().padStart(6, '0').split(/(?=(?:..)*$)/).join(':');
};
