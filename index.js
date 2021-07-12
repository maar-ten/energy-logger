const SerialPort = require('@serialport/stream');
const MockBinding = require('@serialport/binding-mock');
const Regex = require('@serialport/parser-regex');
const { fromEvent } = require('rxjs');
const { readFileSync } = require('fs');
const { InfluxdbWriter } = require('./influxdb-writer');

const testData = readFileSync('example-message.txt', 'utf8');

const { DSMR_MESSAGE_END_REGEX, DsmrMessageParser } = require('./dsmr-message-parser');
const { map, tap, bufferCount } = require('rxjs/operators');
const PORT_ADDRESS = '/dev/ttyUSB0';

SerialPort.Binding = MockBinding;
MockBinding.createPort(PORT_ADDRESS, { echo: false, record: false });

const port = new SerialPort(PORT_ADDRESS, {
    baudRate: 115200,
    parity: 'none'
});
port.on('open', () => port.binding.emitData(testData));
const serialPortMessages = port.pipe(new Regex({ regex: DSMR_MESSAGE_END_REGEX }));

const writer = new InfluxdbWriter();

const messages$ = fromEvent(serialPortMessages, 'data').pipe(
    // parse data from the message
    map(DsmrMessageParser.parse),
    // map to influxdb point
    map(writer.toPoint),
    // buffer for efficiency (900=~15min)
    bufferCount(1),
    // write to DB
    tap(writer.toInflux)
);
messages$.subscribe(console.log);

