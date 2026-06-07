/**
 * Calculate CRC16 checksum (CRC-16/IBM / CRC-16/ARC)
 * Used by DSMR P1 telegrams.
 */
export function crc16(data: string): number {
  let crc = 0x0000;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x0001) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}

/**
 * Validate the CRC of a DSMR telegram.
 * The CRC is calculated from '/' up to and including '!'.
 * The result is compared to the 4-digit hex value after '!'.
 */
export function validateCrc(telegram: string): boolean {
  const bangIndex = telegram.indexOf('!');
  if (bangIndex === -1) return false;

  const dataToCheck = telegram.substring(0, bangIndex + 1);
  const crcString = telegram.substring(bangIndex + 1).trim();

  if (!crcString || crcString.length < 4) return false;

  const expectedCrc = Number.parseInt(crcString.substring(0, 4), 16);
  const calculatedCrc = crc16(dataToCheck);

  return calculatedCrc === expectedCrc;
}