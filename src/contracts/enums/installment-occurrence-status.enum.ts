export enum OccurrenceStatusEnum {
  Scheduled = 'SCHEDULED', // vai acontecer, ainda não virou transação
  Paused = 'PAUSED', // congelada enquanto o contrato está pausado
  Closed = 'CLOSED', // encerrada por pagamento de fatura/ciclo
  Posted = 'POSTED', // já virou transação real
  Cancelled = 'CANCELLED', // cancelada explicitamente (não acontece mais)
  Skipped = 'SKIPPED', // pulada (ex: “não pagar este mês”)
}
