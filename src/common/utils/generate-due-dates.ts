import { IntervalEnum } from "src/contracts/enums/interval.enum";

export function generateDueDates(
    firstDueDate: string,
    interval: IntervalEnum,
    count: number,
  ): string[] {
    const dates: string[] = [];
    const [y, m, d] = firstDueDate.split('-').map(Number);

    // usa Date UTC pra não sofrer com timezone local
    const base = new Date(Date.UTC(y, m - 1, d));

    for (let i = 0; i < count; i++) {
      const dt = new Date(base.getTime());

      switch (interval) {
        case IntervalEnum.Daily:
          dt.setUTCDate(dt.getUTCDate() + i);
          break;
        case IntervalEnum.Weekly:
          dt.setUTCDate(dt.getUTCDate() + i * 7);
          break;
        case IntervalEnum.Monthly:
          dt.setUTCMonth(dt.getUTCMonth() + i);
          break;
        case IntervalEnum.Yearly:
          dt.setUTCFullYear(dt.getUTCFullYear() + i);
          break;
      }

      dates.push(dt.toISOString().slice(0, 10));
    }

    return dates;
  }