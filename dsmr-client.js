const SerialPort = require('serialport');
const Regex = require('@serialport/parser-regex');
const { map } = require('rxjs/operators');

const { DSMR_MESSAGE_END_REGEX } = require('./dsmr-message-parser');

const PORT_ADDRESS = '/dev/ttyUSB0';

/**
 * Uncomment below here to bind a mock device to the serial port
 */
const MockBinding = require('@serialport/binding-mock');
const { readFileSync } = require('fs');
const { interval } = require('rxjs');
const { take } = require('rxjs/operators');
const testData = readFileSync('example-dsmr-messages.txt', 'utf8').split('[BREAK]');
const testData$ = interval(1000).pipe(
  take(testData.length),
  map(index => testData[index])
);
SerialPort.Binding = MockBinding;
MockBinding.createPort(PORT_ADDRESS, { echo: false, record: false });

class DsmrClient {
    constructor() {
        console.log(`Setup connection to serial port ${PORT_ADDRESS}`);
        this.port = new SerialPort(PORT_ADDRESS, {
            baudRate: 115200,
            parity: 'none'
          });

        // Uncomment below for sending mock data
        this.port.on('open', () => testData$.subscribe(data => this.port.binding.emitData(data)));
    }

    listen() {
        console.log('Start listening for DSMR messages');
        return this.port.pipe(new Regex({ regex: DSMR_MESSAGE_END_REGEX }));
    }
}

module.exports = { DsmrClient };