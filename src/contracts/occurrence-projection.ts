import {
  ContractOccurrenceDto,
  OccurrenceSource,
} from './dtos/contract-occorence.dto';
import { OccurrenceStatusEnum } from './enums/installment-occurrence-status.enum';

type PersistedOverride = {
  dueDate: string | Date;
  amount: string;
  status: OccurrenceStatusEnum;
  transactionId: string | null;
};

export class OccurrenceProjection {
  static project(
    generated: ContractOccurrenceDto[],
    overrides: PersistedOverride[],
  ): ContractOccurrenceDto[] {
    const map = new Map<string, ContractOccurrenceDto>();

    for (const g of generated) {
      map.set(g.dueDate, g);
    }

    for (const o of overrides) {
      const dueDateKey = normalizeDateOnly(o.dueDate);

      map.set(dueDateKey, {
        dueDate: dueDateKey,
        amount: String(o.amount),
        status: o.status,
        transactionId: o.transactionId ?? null,
        source: 'OVERRIDE' as OccurrenceSource,
      });
    }

    return Array.from(map.values()).sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate),
    );
  }
}

function normalizeDateOnly(value: string | Date): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))
    return value;

  const d = typeof value === 'string' ? new Date(value) : value;

  // date-only em UTC pra evitar bug de timezone
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
