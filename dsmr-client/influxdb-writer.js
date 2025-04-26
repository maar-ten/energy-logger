const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { PingAPI } = require('@influxdata/influxdb-client-apis');

const { DSMR_OBIS_NAMES } = require('./dsmr-message-parser');

const influxdbHost = process.env.INFLUXDB_HOST || 'http://localhost';
const influxdbPort = process.env.INFLUXDB_PORT || 8086;
const influxdbUrl = `${influxdbHost}:${influxdbPort}`;

class InfluxdbWriter {
    constructor() {
        console.log(`Setup connection to InfluxDB on ${influxdbUrl}`);
        const influxdb = new InfluxDB({ url: influxdbUrl, token: 'dsmrdsmr' });
        this.influxWrite = influxdb.getWriteApi('dsmr', 'dsmr');
        this.pingApi = new PingAPI(influxdb);
    }

    async toInflux(points) {
        this.influxWrite.writePoints(points);
        await this.influxWrite.flush()
          .catch(err => console.error(err));
    }

    toPoint(data) {
        return new Point('dsmr')
            .timestamp(toUtc(data.timestamp))
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

function toUtc(timestamp) {
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset();
  const utcTimestamp = date.getTime() + offset * 60 * 1000;
  return new Date(utcTimestamp);
}

module.exports = { InfluxdbWriter };
