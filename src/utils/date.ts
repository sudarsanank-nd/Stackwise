/** Local calendar day key, e.g. 2026-10-28. */
export const dayKey = (d: Date | string = new Date()) => {
  const x = typeof d === 'string' ? new Date(d) : d;
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const daysAgo = (n: number, from = new Date()) => addDays(from, -n);
