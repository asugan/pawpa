/**
 * Centralized date conversion utilities for consistent ISO 8601 handling
 * between the mobile app and backend API
 */

/**
 * Convert Date object to ISO 8601 string
 * @param date - Date object, null, or undefined
 * @returns ISO 8601 datetime string or undefined if invalid
 */
export function toISOString(date: Date | null | undefined): string | undefined {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

/**
 * Convert Date object to ISO 8601 date-only string (YYYY-MM-DD)
 * @param date - Date object, null, or undefined
 * @returns Date-only string in YYYY-MM-DD format or undefined if invalid
 */
export function toISODateString(date: Date | null | undefined): string | undefined {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return undefined;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert Date object to time string (HH:MM)
 * @param date - Date object, null, or undefined
 * @returns Time string in HH:MM format or undefined if invalid
 */
export function toTimeString(date: Date | null | undefined): string | undefined {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return undefined;
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Combine separate date and time strings into full ISO 8601 datetime
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timeStr - Time string in HH:MM format
 * @returns Full ISO 8601 datetime string
 * @throws Error if date or time format is invalid
 */
export function combineDateTimeToISO(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) {
    throw new Error('Both date and time are required');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }
  if (!/^\d{2}:\d{2}$/.test(timeStr)) {
    throw new Error('Invalid time format. Expected HH:MM');
  }
  return `${dateStr}T${timeStr}:00.000Z`;
}

/**
 * Parse ISO 8601 string to Date object for display purposes
 * @param isoString - ISO 8601 datetime string
 * @returns Date object or null if invalid
 */
export function parseISODate(isoString: string | null | undefined): Date | null {
  if (!isoString) {
    return null;
  }
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
}

/**
 * Split ISO datetime string into separate date and time parts
 * @param isoString - ISO 8601 datetime string
 * @returns Object with date (YYYY-MM-DD) and time (HH:MM) or null if invalid
 */
export function splitISODateTime(isoString: string | null | undefined): { date: string; time: string } | null {
  if (!isoString) {
    return null;
  }
  const parts = isoString.slice(0, 16).split('T');
  if (parts.length !== 2) {
    return null;
  }
  return {
    date: parts[0],
    time: parts[1],
  };
}

/**
 * Type guard to check if value is a valid Date
 * @param value - Value to check
 * @returns True if value is a valid Date object
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if string is valid ISO 8601 datetime
 * @param value - Value to check
 * @returns True if value is a valid ISO 8601 datetime string
 */
export function isISODateTimeString(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  const date = new Date(value);
  return !isNaN(date.getTime()) && value.includes('T');
}

/**
 * Convert any date-like value to ISO string
 * Handles Date objects, ISO strings, and timestamps
 * @param value - Date, ISO string, or timestamp
 * @returns ISO 8601 datetime string or undefined if invalid
 */
export function normalizeToISOString(value: Date | string | number | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    // Already a string, validate it's a valid date
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    // If it's already ISO format, return as-is
    if (value.includes('T')) {
      return value;
    }
    // Otherwise convert to full ISO
    return date.toISOString();
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  }

  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      return undefined;
    }
    return value.toISOString();
  }

  return undefined;
}
