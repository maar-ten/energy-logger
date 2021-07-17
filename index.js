const SerialPort = require('@serialport/stream');
const MockBinding = require('@serialport/binding-mock');
const Regex = require('@serialport/parser-regex');
const { readFileSync } = require('fs');
const { fromEvent, interval } = require('rxjs');
const { map, tap, take, bufferCount } = require('rxjs/operators');

const { InfluxdbWriter } = require('./influxdb-writer');
const { DsmrMessageParser, DSMR_MESSAGE_END_REGEX } = require('./dsmr-message-parser');

const testData = readFileSync('example-message.txt', 'utf8').split('[BREAK]');
const testData$ = interval(1000).pipe(
    take(testData.length),
    map(index => testData[index])
);
SerialPort.Binding = MockBinding;

const PORT_ADDRESS = '/dev/ttyUSB0';

MockBinding.createPort(PORT_ADDRESS, { echo: false, record: false });

const port = new SerialPort(PORT_ADDRESS, {
    baudRate: 115200,
    parity: 'none'
});

port.on('open', () => testData$.subscribe(data => port.binding.emitData(data)));
const serialPortMessages = port.pipe(new Regex({ regex: DSMR_MESSAGE_END_REGEX }));

const writer = new InfluxdbWriter();

const messages$ = fromEvent(serialPortMessages, 'data').pipe(
    // parse data from the message
    map(DsmrMessageParser.parse),
    // convert to influxdb point
    map(msg => writer.toPoint(msg)),
    // buffer data for writing efficiency (900=~15min)
    bufferCount(900),
    // write to DB
    tap(points => writer.toInflux(points))
);
messages$.subscribe({ error: console.error });

