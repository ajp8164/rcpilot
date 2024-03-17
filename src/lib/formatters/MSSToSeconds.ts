// Converts minutes and seconds to seconds.
export const MSSToSeconds = (value: number | string) => {
  let v = typeof value === 'string' ? parseFloat(value) : value;
  const m = Math.trunc(v);
  const s = (v - m) * 100;
  return Math.trunc((m * 60) + s);
};
