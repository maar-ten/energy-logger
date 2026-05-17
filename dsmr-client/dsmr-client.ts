import { SerialPort } from 'serialport';
import { RegexParser } from '@serialport/parser-regex';

import { DSMR_MESSAGE_END_REGEX } from './dsmr-message-parser.ts';

const PORT_ADDRESS = '/dev/ttyUSB0';

/**
 * Uncomment below here to bind a mock device to the serial port
 */
// import { SerialPortMock } from 'serialport';
// import { readFileSync } from 'fs';
// import { interval } from 'rxjs';
// import { map, take } from 'rxjs/operators';
// const testData = readFileSync('example-dsmr-messages.txt', 'utf8').split('[BREAK]');
// const testData$ = interval(1000).pipe(
//   take(testData.length),
//   map(index => testData[index])
// );
// SerialPortMock.binding.createPort(PORT_ADDRESS);

export class DsmrClient {
    port: SerialPort;

    constructor() {
        console.log(`Setup connection to serial port ${PORT_ADDRESS}`);
        // uncomment the mock and comment the regular port
        // this.port = new SerialPortMock({
        this.port = new SerialPort({
            path: PORT_ADDRESS,
            baudRate: 115200,
            parity: 'none'
        });

        // Uncomment below for sending mock data
        // this.port.on('open', () => testData$.subscribe(data => this.port.port.emitData(data)));
    }

    listen() {
        console.log('Listening for DSMR messages');
        return this.port.pipe(new RegexParser({ regex: DSMR_MESSAGE_END_REGEX }));
    }
}

