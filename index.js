const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const { fromEvent } = require('rxjs');
const { filter, map } = require('rxjs/operators');
const { DSMR_OBIS_KEYS } = require('./constants');

const regexpPower = /1-0:1\.7\.0\(([0-9]*\.[0-9]*)\*kW\)/;
const regexpTimestamp = /([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/;

const port = new SerialPort('/dev/ttyUSB0', {
    baudRate: 115200,
    parity: 'none'
});
const parser = port.pipe(new Readline());

const rows$ = fromEvent(parser, 'data');
const power$ = rows$.pipe(
    filter(row => row.startsWith(DSMR_OBIS_KEYS.power)),
    map(parsePowerFromRow)
);
power$.subscribe(power => console.log(power + ' Watt'));

function parsePowerFromRow(row) {
    const match = regexpPower.exec(row);
    if (match) {
        return parseFloat(match[1]) * 1000;
    }
}

const timestamp$ = rows$.pipe(
    filter(row => row.startsWith(DSMR_OBIS_KEYS.timestamp)),
    map(parseTimeFromRow)
);
timestamp$.subscribe(console.log);

function parseTimeFromRow(row) {
    const match = regexpTimestamp.exec(row);
    if (match) {
        const timestamp = `20${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`;
        return new Date(timestamp).toString();
    }
}

//todo splits de data uit naar een aantal observables die elk hun
// eigen processing doen. Bijvoorbeeld data opslaan in een database.