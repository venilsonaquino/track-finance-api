export type RecurringAmountRevision = {
  effectiveFrom: string;
  amount: string;
};

export function resolveRecurringAmountByDate(
  dueDate: string,
  defaultAmount: string,
  revisions: RecurringAmountRevision[],
): string {
  if (!revisions.length) {
    return defaultAmount;
  }

  let resolved = defaultAmount;
  for (const revision of revisions) {
    if (revision.effectiveFrom <= dueDate) {
      resolved = String(revision.amount);
      continue;
    }
    break;
  }

  return String(resolved);
}
