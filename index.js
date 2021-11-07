const SerialPort = require('serialport');
const Regex = require('@serialport/parser-regex');
const { fromEvent } = require('rxjs');
const { map, skip, bufferCount } = require('rxjs/operators');

const { InfluxdbWriter } = require('./influxdb-writer');
const { DsmrMessageParser, DSMR_MESSAGE_END_REGEX } = require('./dsmr-message-parser');

const PORT_ADDRESS = '/dev/ttyUSB0';

/**
 * Uncomment below here to bind a mock device to the serial port
 */
// const MockBinding = require('@serialport/binding-mock');
// const { readFileSync } = require('fs');
// const { interval } = require('rxjs');
// const { take } = require('rxjs/operators');
// const testData = readFileSync('example-message.txt', 'utf8').split('[BREAK]');
// const testData$ = interval(1000).pipe(
//   take(testData.length),
//   map(index => testData[index])
// );
// SerialPort.Binding = MockBinding;
// MockBinding.createPort(PORT_ADDRESS, { echo: false, record: false });

const port = new SerialPort(PORT_ADDRESS, {
  baudRate: 115200,
  parity: 'none'
});
// Uncomment below for sending mock data
// port.on('open', () => testData$.subscribe(data => port.binding.emitData(data)));

const serialPortMessages = port.pipe(new Regex({ regex: DSMR_MESSAGE_END_REGEX }));

const writer = new InfluxdbWriter();

const messages$ = fromEvent(serialPortMessages, 'data').pipe(
  // skip first message, because it may be incomplete
  skip(1),
  // parse data from the message
  map(DsmrMessageParser.parse),
  // convert to influxdb point
  map(writer.toPoint),
  // buffer data for writing efficiency (600=~10min)
  bufferCount(1)
);
messages$.subscribe({
  next: writer.toInflux,
  error: console.error
});

