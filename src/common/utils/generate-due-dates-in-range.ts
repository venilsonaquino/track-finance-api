import { IntervalEnum } from 'src/contracts/enums/interval.enum';
import { createDueDateBuilder } from './create-due-date-builder';

export function generateDueDatesInRange(
  firstDueDate: string,
  interval: IntervalEnum,
  rangeStart: Date,
  rangeEnd?: Date,
): string[] {
  const dates: string[] = [];
  const buildDate = createDueDateBuilder(firstDueDate, interval);

  const startMs = rangeStart.getTime();
  const endMs = (rangeEnd ?? rangeStart).getTime();

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
