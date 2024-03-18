// Converts minutes and seconds to seconds.
export const MSSToSeconds = (value: number | string) => {
  const v = typeof value === 'string' ? parseFloat(value) : value;
  const m = Math.trunc(v);
  const s = (v - m) * 100;
  return Math.trunc(m * 60 + s);
};
