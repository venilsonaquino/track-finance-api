import { IntervalEnum } from 'src/contracts/enums/interval.enum';
import { parseIsoDateOnly } from './parse-iso-date-only';

export function isDueDateOnSchedule(
  firstDueDate: string,
  interval: IntervalEnum,
  dueDate: string,
): boolean {
  const first = parseIsoDateOnly(firstDueDate);
  const target = parseIsoDateOnly(dueDate);
  if (!first || !target) return false;

  // não faz sentido sobrescrever antes do contrato começar
  if (target.getTime() < first.getTime()) return false;

  const daysDiff = Math.floor(
    (target.getTime() - first.getTime()) / (24 * 60 * 60 * 1000),
  );

  switch (interval) {
    case IntervalEnum.Daily:
      return true;

    case IntervalEnum.Weekly:
      return daysDiff % 7 === 0;

    case IntervalEnum.Monthly:
      // regra simples: mesmo “dia do mês” do firstDueDate
      // (se você quiser lidar com meses sem o dia 31, dá pra evoluir depois)
      return target.getUTCDate() === first.getUTCDate();

    case IntervalEnum.Yearly:
      return (
        target.getUTCDate() === first.getUTCDate() &&
        target.getUTCMonth() === first.getUTCMonth()
      );

    default:
      return false;
  }
}
