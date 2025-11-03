/**
 * Date utility functions
 */

/**
 * Get default date (tomorrow)
 */
export function getDefaultDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

/**
 * Get today's date in ISO format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Parse date to month and date number
 */
export function parseDateToMonthDay(dateString: string): { month: string; date: string } {
  const selectedDate = new Date(dateString);
  return {
    month: String(selectedDate.getMonth() + 1),
    date: String(selectedDate.getDate()),
  };
}
