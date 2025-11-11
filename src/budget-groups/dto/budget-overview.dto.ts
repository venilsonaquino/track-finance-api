export interface MonthlyValues {
  Jan: number;
  Fev: number;
  Mar: number;
  Abr: number;
  Mai: number;
  Jun: number;
  Jul: number;
  Ago: number;
  Set: number;
  Out: number;
  Nov: number;
  Dez: number;
}

export function createZeroYear(): MonthlyValues {
  return {
    Jan: 0,
    Fev: 0,
    Mar: 0,
    Abr: 0,
    Mai: 0,
    Jun: 0,
    Jul: 0,
    Ago: 0,
    Set: 0,
    Out: 0,
    Nov: 0,
    Dez: 0,
  };
}

export interface BudgetRowComputed {
  id: string;
  label: string;
  refSectionTitle: string;
}

export interface BudgetRowEditable {
  id: string;
  label: string;
  values: MonthlyValues;
}

export interface BudgetSectionComputed {
  id: string;
  title: string;
  kind: 'computed';
  color: string;
  footerLabel: string;
  rows: BudgetRowComputed[];
}

export interface BudgetSectionEditable {
  id: string;
  title: string;
  kind: 'editable';
  color: string;
  footerLabel: string;
  rows: BudgetRowEditable[];
}

export class BudgetOverviewDto {
  version: number;
  year: number;
  locale: string;
  currency: string;
  months: string[];
  sectionsComputed: BudgetSectionComputed;
  sectionsEditable: BudgetSectionEditable[];

  constructor(data: {
    year: number;
    sectionsComputed: BudgetSectionComputed;
    sectionsEditable: BudgetSectionEditable[];
  }) {
    this.version = 1;
    this.year = data.year;
    this.locale = 'pt-BR';
    this.currency = 'BRL';
    this.months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    this.sectionsComputed = data.sectionsComputed;
    this.sectionsEditable = data.sectionsEditable;
  }
}

