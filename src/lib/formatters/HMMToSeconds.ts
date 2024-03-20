// Converts hours and minutes to seconds.
export const HMMToSeconds = (value: number | string) => {
  const v = typeof value === 'string' ? parseFloat(value) : value;
  const h = Math.trunc(v);
  const m = (v - h) * 100;
  return Math.trunc(h * 3600 + m * 60);
};
