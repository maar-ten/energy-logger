export interface PowerFailureEvent {
  timestampUtc: Date;
  durationSeconds: number;
}

export interface GasMeter {
  deviceType: number;
  identifier: string;
  timestamp: Date;
  reading: number; // m3
}

export interface DsmrTelegram {
  /** Identification string of the P1 meter */
  identification: string;

  /** DSMR version (e.g. "50" for 5.0) */
  dsmrVersion: string;

  /** Timestamp of the telegram */
  timestamp: Date;

  /** Equipment identifier */
  equipmentIdentifier: string;

  /** Electricity delivered to client tariff 1 (kWh) */
  electricityDeliveredTariff1: number;

  /** Electricity delivered to client tariff 2 (kWh) */
  electricityDeliveredTariff2: number;

  /** Electricity returned by client tariff 1 (kWh) */
  electricityReturnedTariff1: number;

  /** Electricity returned by client tariff 2 (kWh) */
  electricityReturnedTariff2: number;

  /** Active tariff (1 or 2) */
  activeTariff: number;

  /** Current power usage (kW) */
  currentPowerUsage: number;

  /** Current power return (kW) */
  currentPowerReturn: number;

  /** Number of power failures in any phase */
  powerFailures: number;

  /** Number of long power failures in any phase */
  longPowerFailures: number;

  /** Power failure event log */
  powerFailureEventLog: PowerFailureEvent[];

  /** Number of voltage sags in phase L1 */
  voltageSagsL1: number;

  /** Number of voltage sags in phase L2 */
  voltageSagsL2: number;

  /** Number of voltage sags in phase L3 */
  voltageSagsL3: number;

  /** Number of voltage swells in phase L1 */
  voltageSwellsL1: number;

  /** Number of voltage swells in phase L2 */
  voltageSwellsL2: number;

  /** Number of voltage swells in phase L3 */
  voltageSwellsL3: number;

  /** Text message */
  textMessage: string;

  /** Instantaneous voltage L1 (V) */
  voltageL1: number;

  /** Instantaneous voltage L2 (V) */
  voltageL2: number;

  /** Instantaneous voltage L3 (V) */
  voltageL3: number;

  /** Instantaneous current L1 (A) */
  currentL1: number;

  /** Instantaneous current L2 (A) */
  currentL2: number;

  /** Instantaneous current L3 (A) */
  currentL3: number;

  /** Instantaneous active power L1 usage (kW) */
  powerUsageL1: number;

  /** Instantaneous active power L2 usage (kW) */
  powerUsageL2: number;

  /** Instantaneous active power L3 usage (kW) */
  powerUsageL3: number;

  /** Instantaneous active power L1 return (kW) */
  powerReturnL1: number;

  /** Instantaneous active power L2 return (kW) */
  powerReturnL2: number;

  /** Instantaneous active power L3 return (kW) */
  powerReturnL3: number;

  /** Gas meter (MSN slave device) */
  gasMeter: GasMeter | null;

  /** Raw CRC value from telegram */
  crc: string;

  /** Whether the CRC is valid */
  crcValid: boolean;

  /** Raw telegram string */
  raw: string;
}

export interface ParseOptions {
  /** Whether to validate the CRC checksum. Default: true */
  validateCrc?: boolean;
}