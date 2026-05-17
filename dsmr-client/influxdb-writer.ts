import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { PingAPI } from '@influxdata/influxdb-client-apis';

import { DSMR_OBIS_NAMES } from './dsmr-message-parser.ts';

const influxdbHost = process.env.INFLUXDB_HOST || 'http://localhost';
const influxdbPort = process.env.INFLUXDB_PORT || 8086;
const influxdbUrl = `${influxdbHost}:${influxdbPort}`;

interface DSMRData {
    timestamp: Date;
    receivedTariff1: number;
    receivedTariff2: number;
    tariffIndicator: string;
    power: number;
}

export class InfluxdbWriter {
    influxWrite: ReturnType<InstanceType<typeof InfluxDB>['getWriteApi']>;
    pingApi: PingAPI;

    constructor() {
        console.log(`Setup connection to InfluxDB on ${influxdbUrl}`);
        const influxdb = new InfluxDB({ url: influxdbUrl, token: 'dsmrdsmr' });
        this.influxWrite = influxdb.getWriteApi('dsmr', 'dsmr');
        this.pingApi = new PingAPI(influxdb);
    }

    async toInflux(points: Point[]): Promise<void> {
        this.influxWrite.writePoints(points);
        await this.influxWrite.flush()
            .catch(err => console.error(err));
    }

    toPoint(data: DSMRData): Point {
        return new Point('dsmr')
            .timestamp(data.timestamp)
            .floatField(DSMR_OBIS_NAMES.receivedTariff1, data.receivedTariff1)
            .floatField(DSMR_OBIS_NAMES.receivedTariff2, data.receivedTariff2)
            .stringField(DSMR_OBIS_NAMES.tariffIndicator, data.tariffIndicator)
            .intField(DSMR_OBIS_NAMES.power, data.power);
    }

    isReady() {
        return this.pingApi.getPing();
    }

    close() {
        this.influxWrite.close();
    }
}

