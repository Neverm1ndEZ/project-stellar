// src/lib/utils.ts

/**
 * Formats a number as Indian Rupee (INR) currency
 * Handles edge cases like null/undefined, non-numbers, and negative values
 * Uses the Indian locale and INR currency format
 *
 * @param amount - The amount to format
 * @param options - Optional configuration for currency formatting
 * @returns Formatted currency string with ₹ symbol
 *
 * Examples:
 * formatCurrency(1234.5) => "₹1,234.50"
 * formatCurrency(1234567.89) => "₹12,34,567.89"
 * formatCurrency(null) => "₹0.00"
 * formatCurrency(-1234.5) => "-₹1,234.50"
 */
export function formatCurrency(
  amount: number | null | undefined,
  options: {
    /**
     * Should we display the currency symbol?
     * @default true
     */
    symbol?: boolean;

    /**
     * Maximum fraction digits to show
     * @default 2
     */
    maximumFractionDigits?: number;

    /**
     * Minimum fraction digits to show
     * @default 2
     */
    minimumFractionDigits?: number;
  } = {},
): string {
  // Set default options
  const {
    symbol = true,
    maximumFractionDigits = 2,
    minimumFractionDigits = 2,
  } = options;

  // Handle null/undefined values
  if (amount == null) {
    amount = 0;
  }

  // Ensure we're working with a number
  const numericAmount = Number(amount);

  // Check if the conversion resulted in a valid number
  if (isNaN(numericAmount)) {
    console.error(`Invalid amount provided to formatCurrency: ${amount}`);
    return symbol ? "₹0.00" : "0.00";
  }

  try {
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits,
      minimumFractionDigits,
      // Remove the symbol if not needed
      currencyDisplay: symbol ? "symbol" : "code",
    }).format(numericAmount);

    // If we don't want the symbol, remove the 'INR' code
    return symbol ? formatted : formatted.replace("INR", "").trim();
  } catch (error) {
    console.error("Error formatting currency:", error);
    // Fallback formatting for edge cases
    const fallbackFormatted = symbol
      ? `₹${Math.abs(numericAmount).toFixed(2)}`
      : Math.abs(numericAmount).toFixed(2);
    return numericAmount < 0 ? `-${fallbackFormatted}` : fallbackFormatted;
  }
}

/**
 * Helper to parse a currency string back to a number
 * Useful for form inputs and calculations
 *
 * @param currencyString - The currency string to parse
 * @returns number value or null if invalid
 *
 * Example:
 * parseCurrency("₹1,234.50") => 1234.50
 */
export function parseCurrency(currencyString: string): number | null {
  try {
    // Remove currency symbol and commas
    const cleanString = currencyString.replace(/[₹,]/g, "").trim();

    const parsed = parseFloat(cleanString);

    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}
