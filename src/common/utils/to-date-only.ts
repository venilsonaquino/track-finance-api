import { parseIsoDateOnly } from './parse-iso-date-only';

export function toDateOnly(value: Date | string): Date {
  const dt =
    typeof value === 'string'
      ? (parseIsoDateOnly(value) ?? new Date(value))
      : value;
  return new Date(
    Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()),
  );
}
