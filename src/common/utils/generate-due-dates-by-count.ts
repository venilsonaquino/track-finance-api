import { IntervalEnum } from 'src/contracts/enums/interval.enum';
import { createDueDateBuilder } from './create-due-date-builder';

export function generateDueDatesByCount(
  firstDueDate: string,
  interval: IntervalEnum,
  count: number,
): string[] {
  const buildDate = createDueDateBuilder(firstDueDate, interval);
  const dates: string[] = [];

  for (let i = 0; i < count; i++) {
    dates.push(buildDate(i).toISOString().slice(0, 10));
  }

  return dates;
}
