import { IntervalEnum } from 'src/contracts/enums/interval.enum';

export function generateDueDates(
  firstDueDate: string,
  interval: IntervalEnum,
  count: number,
): string[];
export function generateDueDates(
  firstDueDate: string,
  interval: IntervalEnum,
  rangeStart: Date,
  rangeEnd: Date,
): string[];
export function generateDueDates(
  firstDueDate: string,
  interval: IntervalEnum,
  countOrStart: number | Date,
  rangeEnd?: Date,
): string[] {
  const dates: string[] = [];
  const [y, m, d] = firstDueDate.split('-').map(Number);

  // usa Date UTC pra não sofrer com timezone local
  const base = new Date(Date.UTC(y, m - 1, d));

  const buildDate = (offset: number) => {
    const dt = new Date(base.getTime());

    switch (interval) {
      case IntervalEnum.Daily:
        dt.setUTCDate(dt.getUTCDate() + offset);
        break;
      case IntervalEnum.Weekly:
        dt.setUTCDate(dt.getUTCDate() + offset * 7);
        break;
      case IntervalEnum.Monthly:
        dt.setUTCMonth(dt.getUTCMonth() + offset);
        break;
      case IntervalEnum.Yearly:
        dt.setUTCFullYear(dt.getUTCFullYear() + offset);
        break;
    }

    return dt;
  };

  if (typeof countOrStart === 'number') {
    for (let i = 0; i < countOrStart; i++) {
      dates.push(buildDate(i).toISOString().slice(0, 10));
    }
    return dates;
  }

  const startMs = countOrStart.getTime();
  const endMs = (rangeEnd ?? countOrStart).getTime();

  for (let i = 0; ; i++) {
    const occurrenceDate = buildDate(i);
    const occurrenceMs = occurrenceDate.getTime();

    if (occurrenceMs > endMs) break;
    if (occurrenceMs >= startMs) {
      dates.push(occurrenceDate.toISOString().slice(0, 10));
    }
  }

  return dates;
}
