export enum OccurrenceStatusEnum {
  Scheduled = 'SCHEDULED', // vai acontecer, ainda não virou transação
  Posted = 'POSTED',       // já virou transação real
  Cancelled = 'CANCELLED', // cancelada explicitamente (não acontece mais)
  Skipped = 'SKIPPED',     // pulada (ex: “não pagar este mês”)
}
