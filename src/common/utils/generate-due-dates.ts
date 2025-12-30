import { InstallmentInterval } from "src/contracts/enums/installment-interval.enum";

export function generateDueDates(
    firstDueDate: string,
    interval: InstallmentInterval,
    count: number,
  ): string[] {
    const dates: string[] = [];
    const [y, m, d] = firstDueDate.split('-').map(Number);

    // usa Date UTC pra não sofrer com timezone local
    const base = new Date(Date.UTC(y, m - 1, d));

    for (let i = 0; i < count; i++) {
      const dt = new Date(base.getTime());

      switch (interval) {
        case InstallmentInterval.Daily:
          dt.setUTCDate(dt.getUTCDate() + i);
          break;
        case InstallmentInterval.Weekly:
          dt.setUTCDate(dt.getUTCDate() + i * 7);
          break;
        case InstallmentInterval.Monthly:
          dt.setUTCMonth(dt.getUTCMonth() + i);
          break;
        case InstallmentInterval.Yearly:
          dt.setUTCFullYear(dt.getUTCFullYear() + i);
          break;
      }

      dates.push(dt.toISOString().slice(0, 10));
    }

    return dates;
  }