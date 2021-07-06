const SerialPort = require('@serialport/stream');
const MockBinding = require('@serialport/binding-mock');
const Regex = require('@serialport/parser-regex');
const { fromEvent } = require('rxjs');
const { readFileSync } = require('fs');

const testData = readFileSync('example-message.txt', 'utf8');

const { DSMR_MESSAGE_END_REGEX, DsrmMessageParser } = require('./dsrm-message-parser');
const PORT_ADDRESS = '/dev/ttyUSB0';

SerialPort.Binding = MockBinding;
MockBinding.createPort(PORT_ADDRESS, { echo: false, record: false });

const port = new SerialPort(PORT_ADDRESS, {
    baudRate: 115200,
    parity: 'none'
});

port.on('open', () => port.binding.emitData(testData));

const serialPortMessages = port.pipe(new Regex({ regex: DSMR_MESSAGE_END_REGEX }));

const messages$ = fromEvent(serialPortMessages, 'data');
messages$.subscribe(DsrmMessageParser.parse);
