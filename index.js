const SerialPort = require('@serialport/stream');
const MockBinding = require('@serialport/binding-mock');
const Regex = require('@serialport/parser-regex');
const { fromEvent } = require('rxjs');
const { readFileSync } = require('fs');
const {InfluxDB, Point} = require('@influxdata/influxdb-client');

const testData = readFileSync('example-message.txt', 'utf8');

const influxdb = new InfluxDB({url: 'http://localhost:8086', token: 'dsmrdsmr'});
const influxWrite = influxdb.getWriteApi('dsmr', 'dsmr');

const { DSMR_MESSAGE_END_REGEX, DsmrMessageParser, DSMR_OBIS_NAMES } = require('./dsmr-message-parser');
const { map, tap } = require('rxjs/operators');
const PORT_ADDRESS = '/dev/ttyUSB0';

SerialPort.Binding = MockBinding;
MockBinding.createPort(PORT_ADDRESS, { echo: false, record: false });

const port = new SerialPort(PORT_ADDRESS, {
    baudRate: 115200,
    parity: 'none'
});
port.on('open', () => port.binding.emitData(testData));
const serialPortMessages = port.pipe(new Regex({ regex: DSMR_MESSAGE_END_REGEX }));

const messages$ = fromEvent(serialPortMessages, 'data').pipe(
    map(DsmrMessageParser.parse),
    map(toPoint),
    tap(write)
);
messages$.subscribe(console.log);

function toPoint(data) {
    return new Point('dsmr')
    .timestamp(new Date(data.timestamp))
    .floatField(DSMR_OBIS_NAMES.receivedTariff1, data.receivedTariff1)
    .floatField(DSMR_OBIS_NAMES.receivedTariff2, data.receivedTariff2)
    .stringField(DSMR_OBIS_NAMES.tariffIndicator, data.tariffIndicator)
    .intField(DSMR_OBIS_NAMES.power, data.power)
}

function write(point) {
    influxWrite.writePoint(point);
    influxWrite.close();
}