export function parseDurationToSeconds(input: string, fallbackSeconds: number): number {
  const v = (input || '').trim().toLowerCase();
  if (!v) return fallbackSeconds;

  // numeric seconds
  if (/^\d+$/.test(v)) return Number(v);

  const m = v.match(/^(\d+)\s*(s|m|h|d)$/);
  if (!m) return fallbackSeconds;

  const n = Number(m[1]);
  const unit = m[2];

  switch (unit) {
    case 's':
      return n;
    case 'm':
      return n * 60;
    case 'h':
      return n * 60 * 60;
    case 'd':
      return n * 24 * 60 * 60;
    default:
      return fallbackSeconds;
  }
}
