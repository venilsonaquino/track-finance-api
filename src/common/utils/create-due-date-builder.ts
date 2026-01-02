import { IntervalEnum } from 'src/contracts/enums/interval.enum';

export function createDueDateBuilder(firstDueDate: string, interval: IntervalEnum) {
  const [y, m, d] = firstDueDate.split('-').map(Number);

  // Use UTC dates to avoid timezone drift from the host environment.
  const base = new Date(Date.UTC(y, m - 1, d));

  return (offset: number) => {
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
}
