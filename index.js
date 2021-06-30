const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const { fromEvent } = require('rxjs');
const { filter, map } = require('rxjs/operators');

const regexpWattage = /1-0:1\.7\.0\(([0-9]*\.[0-9]*)\*kW\)/;

const port = new SerialPort('/dev/ttyUSB0', {
    baudRate: 115200,
    parity: 'none'
});
const parser = port.pipe(new Readline());

const rows$ = fromEvent(parser, 'data');
const wattage$ = rows$.pipe(
    filter(row => row.startsWith('1-0:1.7.0')),
    map(parseWattageFromRow)
);
wattage$.subscribe(wattage => console.log(wattage + ' Watt'));

function parseWattageFromRow(row) {
    const match = regexpWattage.exec(row);
    if (match) {
        return parseFloat(match[1]) * 1000;
    }
}

//todo splits de data uit naar een aantal observables die elk hun
// eigen processing doen. Bijvoorbeeld data opslaan in een database.