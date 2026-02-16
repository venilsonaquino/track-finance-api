export function parseIsoDateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (isNaN(dt.getTime())) return null;
  if (dt.getUTCFullYear() !== y) return null;
  if (dt.getUTCMonth() !== m - 1) return null;
  if (dt.getUTCDate() !== d) return null;
  return dt;
}
