const SerialPort = require('@serialport/stream');
const MockBinding = require('@serialport/binding-mock');
const Regex = require('@serialport/parser-regex');
const Readline = require('@serialport/parser-readline');
const { fromEvent } = require('rxjs');
const { filter, map } = require('rxjs/operators');

const ObisParser = require('./obis-parser');
const { DSMR_OBIS_KEYS, DSMR_OBIS_REGEX, PARSER_POWER } = require('./constants');
const PORT_ADDRESS = '/dev/ttyUSB0';

SerialPort.Binding = MockBinding;
MockBinding.createPort(PORT_ADDRESS, { echo: false, record: false });

const port = new SerialPort(PORT_ADDRESS, {
    baudRate: 115200,
    parity: 'none'
});

port.on('open', () => port.binding.emitData(`
/XMX5LGF0000443139688

1-3:0.2.8(50)
0-0:1.0.0(210705164046S)
0-0:96.1.1(4530303531303034333133393638383138)
1-0:1.8.1(002810.380*kWh)
1-0:1.8.2(003299.288*kWh)
1-0:2.8.1(000000.000*kWh)
1-0:2.8.2(000000.000*kWh)
0-0:96.14.0(0002)
1-0:1.7.0(00.198*kW)
1-0:2.7.0(00.000*kW)
0-0:96.7.21(00014)
0-0:96.7.9(00003)
1-0:99.97.0(1)(0-0:96.7.19)(180616105531S)(0000000797*s)
1-0:32.32.0(00008)
1-0:32.36.0(00003)
0-0:96.13.0()
1-0:32.7.0(236.2*V)
1-0:31.7.0(001*A)
1-0:21.7.0(00.198*kW)
1-0:22.7.0(00.000*kW)
!5066
`));

const parser = port.pipe(new Regex({ regex: DSMR_OBIS_REGEX.messageEnd }));

const rows$ = fromEvent(parser, 'data');
rows$.subscribe(ObisParser.parse);

// const power$ = rows$.pipe(
//     filter(PARSER_POWER.is),
//     map(PARSER_POWER.parse)
// );
// power$.subscribe(console.log);

// const timestamp$ = rows$.pipe(
//     filter(row => row.startsWith(DSMR_OBIS_KEYS.timestamp)),
//     map(parseTimeFromRow)
// );
// timestamp$.subscribe(console.log);

// function parseTimeFromRow(row) {
//     const match = DSMR_OBIS_REGEX.timestamp.exec(row);
//     if (match) {
//         return `20${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`;
//     }
// }

//todo splits de data uit naar een aantal observables die elk hun
// eigen processing doen. Bijvoorbeeld data opslaan in een database.