import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { format, addDays, startOfDay } from 'date-fns';

/**
 * Get tomorrow's date in a specific timezone
 * This is the minimum date users can select for weather oracles
 */
export function getMinimumSelectableDate(timezone: string): Date {
  // Get current time in the target timezone
  const nowInZone = toZonedTime(new Date(), timezone);
  // Tomorrow in that timezone
  const tomorrowInZone = addDays(startOfDay(nowInZone), 1);
  return tomorrowInZone;
}

/**
 * Check if a date is valid for weather oracle creation
 * Must be at least tomorrow in the city's local timezone
 */
export function isValidWeatherDate(date: Date, timezone: string): boolean {
  const minDate = getMinimumSelectableDate(timezone);
  return date >= minDate;
}

/**
 * Calculate the resolution date for weather oracle
 * Settlement happens at 00:00:01 local time the day AFTER the target date
 * 
 * Example: If user selects Dec 30 for Bangkok weather:
 * - Target date: Dec 30 (we want weather data for this day)
 * - Settlement: Dec 31 00:00:01 Bangkok time (when the day ends and data is available)
 * - UTC resolution_date: Dec 30 17:00:01 UTC (Bangkok is UTC+7)
 */
export function calculateResolutionDate(targetDate: Date, timezone: string): Date {
  // Create midnight (00:00:01) of the day AFTER the target date in the city's timezone
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();
  
  // The day after target date at 00:00:01 local time
  const settlementLocalTime = new Date(year, month, day + 1, 0, 0, 1);
  
  // Convert from local timezone to UTC
  const resolutionDateUTC = fromZonedTime(settlementLocalTime, timezone);
  
  return resolutionDateUTC;
}

/**
 * Format the settlement time preview for the UI
 * Shows both local time (in city's timezone) and UTC
 * 
 * Example output: "Settlement: Dec 31, 00:00 Bangkok time (Dec 30 17:00 UTC)"
 */
export function formatSettlementPreview(targetDate: Date, timezone: string, cityName: string): string {
  const resolutionDateUTC = calculateResolutionDate(targetDate, timezone);
  
  // Get the date in local timezone for display
  const settlementLocal = toZonedTime(resolutionDateUTC, timezone);
  
  const localDateStr = format(settlementLocal, 'MMM d, HH:mm');
  const utcDateStr = format(resolutionDateUTC, 'MMM d HH:mm');
  
  // Extract timezone abbreviation from city timezone
  const tzAbbr = getTimezoneAbbreviation(timezone);
  
  return `Settlement: ${localDateStr} ${tzAbbr} (${utcDateStr} UTC)`;
}

/**
 * Get a simple timezone abbreviation from IANA timezone
 * This is a simplified version - in production you might want a more complete mapping
 */
function getTimezoneAbbreviation(timezone: string): string {
  const tzMap: Record<string, string> = {
    'Asia/Tokyo': 'JST',
    'Asia/Bangkok': 'ICT',
    'Asia/Dubai': 'GST',
    'Asia/Shanghai': 'CST',
    'Asia/Hong_Kong': 'HKT',
    'Asia/Singapore': 'SGT',
    'Asia/Seoul': 'KST',
    'Asia/Kolkata': 'IST',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Europe/Berlin': 'CET',
    'Europe/Moscow': 'MSK',
    'America/New_York': 'EST',
    'America/Chicago': 'CST',
    'America/Denver': 'MST',
    'America/Los_Angeles': 'PST',
    'America/Sao_Paulo': 'BRT',
    'Australia/Sydney': 'AEDT',
    'Pacific/Auckland': 'NZDT',
  };
  
  return tzMap[timezone] || timezone.split('/').pop() || 'Local';
}

/**
 * Format target date for feed title
 * Returns just the date portion (e.g., "30 Dec")
 */
export function formatTargetDateForTitle(date: Date): string {
  return format(date, 'd MMM');
}

/**
 * Format target date in YYYY-MM-DD format for API calls
 */
export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
