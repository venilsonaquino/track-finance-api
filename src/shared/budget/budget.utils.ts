import {
  MonthlyValues,
  createZeroYear,
} from '../../budget-groups/dto/budget-overview.dto';

/**
 * Utility functions for budget calculations
 */

export function calculateTotalForYear(monthlyValues: MonthlyValues): number {
  return Object.values(monthlyValues).reduce((sum, value) => sum + value, 0);
}

export function addMonthlyValues(
  values1: MonthlyValues,
  values2: MonthlyValues,
): MonthlyValues {
  const result = createZeroYear();
  const months = Object.keys(result) as (keyof MonthlyValues)[];

  months.forEach((month) => {
    result[month] = values1[month] + values2[month];
  });

  return result;
}

export function subtractMonthlyValues(
  values1: MonthlyValues,
  values2: MonthlyValues,
): MonthlyValues {
  const result = createZeroYear();
  const months = Object.keys(result) as (keyof MonthlyValues)[];

  months.forEach((month) => {
    result[month] = values1[month] - values2[month];
  });

  return result;
}

export function getMonthAbbreviation(monthIndex: number): keyof MonthlyValues {
  const monthNames: (keyof MonthlyValues)[] = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  return monthNames[monthIndex];
}

export function formatCurrency(
  amount: number,
  locale: string = 'pt-BR',
  currency: string = 'BRL',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
