import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { PingAPI } from '@influxdata/influxdb-client-apis';

import type { DsmrTelegram } from './dsmr-parser/types.ts';

const influxdbHost = process.env['INFLUXDB_HOST'] || 'http://localhost';
const influxdbPort = process.env['INFLUXDB_PORT'] || 8086;
const influxdbUrl = `${influxdbHost}:${influxdbPort}`;

const DSMR_OBIS_NAMES = {
    timestamp: 'timestamp',
    receivedTariff1: 'receivedTariff1',
    receivedTariff2: 'receivedTariff2',
    tariffIndicator: 'tariffIndicator',
    power: 'power'
};

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

    toPoint(data: DsmrTelegram): Point {
        return new Point('dsmr')
            .timestamp(data.timestamp)
            .floatField(DSMR_OBIS_NAMES.receivedTariff1, data.electricityDeliveredTariff1)
            .floatField(DSMR_OBIS_NAMES.receivedTariff2, data.electricityDeliveredTariff2)
            .stringField(DSMR_OBIS_NAMES.tariffIndicator, data.activeTariff)
            .floatField(DSMR_OBIS_NAMES.power, data.currentPowerUsage);
    }

    isReady() {
        return this.pingApi.getPing();
    }

    close() {
        this.influxWrite.close();
    }
}

