export const wordCount = (s: string | undefined) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);

/** Lowercase, strip punctuation (keeps ₹ and digits), collapse whitespace. */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9₹%\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const formatSeconds = (sec: number) => {
  if (sec < 60) return `${Math.max(1, Math.round(sec))} sec`;
  const m = Math.round(sec / 60);
  return `${m} min`;
};
