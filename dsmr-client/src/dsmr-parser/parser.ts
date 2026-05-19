import type { DsmrTelegram, GasMeter, ParseOptions, PowerFailureEvent } from './types.ts';
import { validateCrc } from './crc.ts';
import { extractValues, parseNumeric, parseTimestamp } from './utils.ts';
import { OBIS } from './obis.ts';

/**
 * Parse a DSMR 5 P1 telegram string into a structured object.
 *
 * @param telegram - Raw telegram string
 * @param options  - Parse options
 * @returns        Parsed DsmrTelegram object
 * @throws         Error when the telegram format is invalid
 */
export function parseTelegram(telegram: string, options: ParseOptions = {}): DsmrTelegram {
  const { validateCrc: doValidateCrc = true } = options;

  const lines = telegram.split(/\r?\n/);

  if (!lines[0]?.startsWith('/')) {
    throw new Error('Invalid DSMR telegram: must start with /');
  }

  const identification = lines[0].substring(1).trim();

  // Find CRC line (starts with !)
  const bangIndex = telegram.indexOf('!');
  if (bangIndex === -1) {
    throw new Error('Invalid DSMR telegram: missing ! terminator');
  }

  const crc = telegram.substring(bangIndex + 1).trim().substring(0, 4);
  const crcValid = doValidateCrc ? validateCrc(telegram) : true;

  // Build a map of obis -> line content
  const obisMap = new Map<string, string>();
  for (const line of lines) {
    const parenIndex = line.indexOf('(');
    if (parenIndex > 0) {
      const obisCode = line.substring(0, parenIndex);
      obisMap.set(obisCode, line.substring(parenIndex));
    }
  }

  const getValues = (code: string): string[] => {
    const line = obisMap.get(code);
    return line ? extractValues(line) : [];
  };

  const getNumber = (code: string, index = 0): number => {
    const vals = getValues(code);
    if (!vals[index]) return 0;
    return parseNumeric(vals[index]);
  };

  const getString = (code: string, index = 0): string => {
    const vals = getValues(code);
    return vals[index] ?? '';
  };

  const getTimestamp = (code: string, index = 0): Date => {
    const val = getString(code, index);
    return val ? parseTimestamp(val) : new Date(0);
  };

  // Parse power failure event log: 1-0:99.97.0(count)(0-0:96.7.19)(timestamp)(duration)...
  const powerFailureEventLog: PowerFailureEvent[] = [];
  const eventLogLine = obisMap.get(OBIS.POWER_FAILURE_EVENT_LOG);
  if (eventLogLine) {
    const allVals = extractValues(eventLogLine);
    // allVals[0] = count, allVals[1] = OBIS reference (skip), then pairs of (timestamp)(duration)
    for (let i = 2; i < allVals.length - 1; i += 2) {
      const ts = allVals[i];
      const dur = allVals[i + 1];
      if (ts && dur) {
        powerFailureEventLog.push({
          timestampUtc: parseTimestamp(ts),
          durationSeconds: parseNumeric(dur),
        });
      }
    }
  }

  // Gas meter (MSN slave, channel 1)
  let gasMeter: GasMeter | null = null;
  const gasMsnDeviceType = obisMap.get(OBIS.MSN_DEVICE_TYPE);
  if (gasMsnDeviceType) {
    const gasReadingVals = getValues(OBIS.MSN_READING);
    gasMeter = {
      deviceType: getNumber(OBIS.MSN_DEVICE_TYPE),
      identifier: getString(OBIS.MSN_EQUIPMENT_IDENTIFIER),
      timestamp: gasReadingVals[0] ? parseTimestamp(gasReadingVals[0]) : new Date(0),
      reading: gasReadingVals[1] ? parseNumeric(gasReadingVals[1]) : 0,
    };
  }

  return {
    identification,
    dsmrVersion: getString(OBIS.DSMR_VERSION),
    timestamp: getTimestamp(OBIS.TIMESTAMP),
    equipmentIdentifier: getString(OBIS.EQUIPMENT_IDENTIFIER),
    electricityDeliveredTariff1: getNumber(OBIS.ELECTRICITY_DELIVERED_TARIFF1),
    electricityDeliveredTariff2: getNumber(OBIS.ELECTRICITY_DELIVERED_TARIFF2),
    electricityReturnedTariff1: getNumber(OBIS.ELECTRICITY_RETURNED_TARIFF1),
    electricityReturnedTariff2: getNumber(OBIS.ELECTRICITY_RETURNED_TARIFF2),
    activeTariff: getNumber(OBIS.ACTIVE_TARIFF),
    currentPowerUsage: getNumber(OBIS.CURRENT_POWER_USAGE),
    currentPowerReturn: getNumber(OBIS.CURRENT_POWER_RETURN),
    powerFailures: getNumber(OBIS.POWER_FAILURES),
    longPowerFailures: getNumber(OBIS.LONG_POWER_FAILURES),
    powerFailureEventLog,
    voltageSagsL1: getNumber(OBIS.VOLTAGE_SAGS_L1),
    voltageSagsL2: getNumber(OBIS.VOLTAGE_SAGS_L2),
    voltageSagsL3: getNumber(OBIS.VOLTAGE_SAGS_L3),
    voltageSwellsL1: getNumber(OBIS.VOLTAGE_SWELLS_L1),
    voltageSwellsL2: getNumber(OBIS.VOLTAGE_SWELLS_L2),
    voltageSwellsL3: getNumber(OBIS.VOLTAGE_SWELLS_L3),
    textMessage: getString(OBIS.TEXT_MESSAGE),
    voltageL1: getNumber(OBIS.VOLTAGE_L1),
    voltageL2: getNumber(OBIS.VOLTAGE_L2),
    voltageL3: getNumber(OBIS.VOLTAGE_L3),
    currentL1: getNumber(OBIS.CURRENT_L1),
    currentL2: getNumber(OBIS.CURRENT_L2),
    currentL3: getNumber(OBIS.CURRENT_L3),
    powerUsageL1: getNumber(OBIS.POWER_USAGE_L1),
    powerUsageL2: getNumber(OBIS.POWER_USAGE_L2),
    powerUsageL3: getNumber(OBIS.POWER_USAGE_L3),
    powerReturnL1: getNumber(OBIS.POWER_RETURN_L1),
    powerReturnL2: getNumber(OBIS.POWER_RETURN_L2),
    powerReturnL3: getNumber(OBIS.POWER_RETURN_L3),
    gasMeter,
    crc,
    crcValid,
    raw: telegram,
  };
}

