/**
 * UTC Time Utilities
 * Users see and select times in their LOCAL timezone, but everything is stored/sent as UTC.
 */

/**
 * Get a default resolution date: now + 2 minutes, rounded to nearest minute (in local time).
 */
export function getDefaultLocalResolutionDate(): Date {
  const now = new Date();
  
  // Add 2 minutes
  const futureTime = new Date(now.getTime() + 2 * 60 * 1000);
  
  // Round up to next minute
  const seconds = futureTime.getSeconds();
  if (seconds > 0) {
    futureTime.setMinutes(futureTime.getMinutes() + 1);
    futureTime.setSeconds(0, 0);
  }
  
  return futureTime;
}

/**
 * Get default hour from date (local), formatted as 2-digit string.
 */
export function getDefaultLocalHour(date?: Date): string {
  const d = date || getDefaultLocalResolutionDate();
  return d.getHours().toString().padStart(2, '0');
}

/**
 * Get default minute from date (local), formatted as 2-digit string.
 */
export function getDefaultLocalMinute(date?: Date): string {
  const d = date || getDefaultLocalResolutionDate();
  return d.getMinutes().toString().padStart(2, '0');
}

/**
 * Create a Date from a local date and local hour/minute strings.
 * The result is a JS Date that, when sent to DB, will be correctly serialized as UTC.
 */
export function createDateTimeFromLocal(localDate: Date, localHour: string, localMinute: string): Date {
  const result = new Date(localDate);
  result.setHours(parseInt(localHour), parseInt(localMinute), 0, 0);
  return result;
}

/**
 * Format a date to display in local time with timezone indicator.
 * E.g., "27 Dec 17:00 (local)" 
 */
export function formatLocalDateTime(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${hours}:${minutes}`;
}

/**
 * Format a date as short date only in local time (e.g., "27 Dec")
 */
export function formatLocalDateShort(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${day} ${month}`;
}

/**
 * Format time only in local time (e.g., "17:00")
 */
export function formatLocalTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get local datetime 2 minutes from now for validation (crypto feeds).
 */
export function getMinimumDateTime(): Date {
  return new Date(Date.now() + 2 * 60 * 1000);
}

/**
 * Check if a date is at least 2 minutes in the future.
 */
export function isValidFutureTime(date: Date): boolean {
  return date.getTime() >= getMinimumDateTime().getTime();
}

/**
 * Add hours to a date.
 */
export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Get the user's timezone abbreviation (e.g., "MSK", "EST", "PST")
 */
export function getTimezoneAbbr(): string {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' });
  const parts = formatter.formatToParts(new Date());
  const tzPart = parts.find(part => part.type === 'timeZoneName');
  return tzPart?.value || 'local';
}

/**
 * Format date for display in feed title (UTC representation for consistency)
 */
export function formatDateTimeForTitle(date: Date): string {
  const day = date.getUTCDate();
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${hours}:${minutes} UTC`;
}

// Legacy exports for backward compatibility
export const getDefaultUTCResolutionDate = getDefaultLocalResolutionDate;
export const getDefaultUTCHour = getDefaultLocalHour;
export const getDefaultUTCMinute = getDefaultLocalMinute;
export const createUTCDateTime = createDateTimeFromLocal;
export const formatUTCDateTime = formatDateTimeForTitle;
export const formatUTCDateShort = formatLocalDateShort;
export const formatUTCTime = formatLocalTime;
export const getMinimumUTCDateTime = getMinimumDateTime;
export const addUTCHours = addHours;
