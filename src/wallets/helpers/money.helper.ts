class MoneyHelper {
  /**
   * Converts a value in BRL to cents.
   * Example: R$ 12.34 => 1234
   */
  static toCents(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Converts a value in cents to BRL.
   * Example: 1234 => 12.34
   */
  static centsToAmount(cents: number): number {
    return cents / 100;
  }

  /**
   * Formats a value in cents as currency string.
   * Example: 1234 => "R$ 12,34"
   */
  static formatCents(cents: number): string {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}

export default MoneyHelper;
