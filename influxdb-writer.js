const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { DSMR_OBIS_NAMES } = require('./dsmr-message-parser');

class InfluxdbWriter {
    constructor() {
        const influxdb = new InfluxDB({ url: 'http://localhost:8086', token: 'dsmrdsmr' });
        this.influxWrite = influxdb.getWriteApi('dsmr', 'dsmr');
    }

    toInflux(points) {
        this.influxWrite.writePoints(points);
        this.influxWrite.close();
    }

    toPoint(data) {
        return new Point('dsmr')
            .timestamp(new Date(data.timestamp))
            .floatField(DSMR_OBIS_NAMES.receivedTariff1, data.receivedTariff1)
            .floatField(DSMR_OBIS_NAMES.receivedTariff2, data.receivedTariff2)
            .stringField(DSMR_OBIS_NAMES.tariffIndicator, data.tariffIndicator)
            .intField(DSMR_OBIS_NAMES.power, data.power);
    }
}

module.exports = { InfluxdbWriter };