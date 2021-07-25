const SerialPort = require('serialport');
const Regex = require('@serialport/parser-regex');
const { fromEvent } = require('rxjs');
const { map, skip, bufferCount } = require('rxjs/operators');

const { InfluxdbWriter } = require('./influxdb-writer');
const { DsmrMessageParser, DSMR_MESSAGE_END_REGEX } = require('./dsmr-message-parser');

const PORT_ADDRESS = '/dev/ttyUSB0';

const port = new SerialPort(PORT_ADDRESS, {
    baudRate: 115200,
    parity: 'none'
});

const serialPortMessages = port.pipe(new Regex({ regex: DSMR_MESSAGE_END_REGEX }));

const writer = new InfluxdbWriter();

const messages$ = fromEvent(serialPortMessages, 'data').pipe(
    // skip first message, because it may be incomplete
    skip(1),
    // parse data from the message
    map(DsmrMessageParser.parse),
    // convert to influxdb point
    map(msg => writer.toPoint(msg)),
    // buffer data for writing efficiency (900=~15min)
    bufferCount(600)
);
messages$.subscribe({
  next: points => writer.toInflux(points),
  error: console.error
});

