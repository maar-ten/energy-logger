/**
 * Parse a DSMR timestamp string like "210413084817S" or "210413084817W"
 * Format: YYMMDDHHmmssX where X is S (Summer/DST) or W (Winter)
 */
export function parseTimestamp(value: string): Date {
  const year = 2000 + Number.parseInt(value.substring(0, 2), 10);
  const month = Number.parseInt(value.substring(2, 4), 10) - 1;
  const day = Number.parseInt(value.substring(4, 6), 10);
  const hour = Number.parseInt(value.substring(6, 8), 10);
  const minute = Number.parseInt(value.substring(8, 10), 10);
  const second = Number.parseInt(value.substring(10, 12), 10);
  const dst = value.substring(12) === 'S'; // Summer time (DST)

  // Create UTC date compensating for Dutch timezone (CET=+1, CEST=+2)
  const offsetHours = dst ? 2 : 1;
  const utcMs = Date.UTC(year, month, day, hour - offsetHours, minute, second);
  return new Date(utcMs);
}

/**
 * Extract the value(s) from a DSMR line, e.g. "(001234.567*kWh)" => ["001234.567*kWh"]
 * Returns an array of all parenthesized groups as-is.
 */
export function extractValues(line: string): string[] {
  const results: string[] = [];
  const regex = /\(([^)]*)\)/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match[1] !== undefined) {
      results.push(match[1]);
    }
  }
  return results;
}

/**
 * Parse a numeric value with optional unit, e.g. "001234.567*kWh" => 1234.567
 */
export function parseNumeric(value: string): number {
  const parts = value.split('*');
  const numPart = parts[0];
  if (numPart === undefined || numPart.trim() === '') return 0;
  return Number.parseFloat(numPart);
}