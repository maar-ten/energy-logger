DSMR_OBIS_CODES = {
    timestamp: '0-0:1.0.0',
    receivedTariff1: '1-0:1.8.1',
    receivedTariff2: '1-0:1.8.2',
    tariffIndicator: '0-0:96.14.0',
    power: '1-0:1.7.0'
};

DSMR_OBIS_NAMES = {
    timestamp: 'timestamp',
    receivedTariff1: 'receivedTariff1',
    receivedTariff2: 'receivedTariff2',
    tariffIndicator: 'tariffIndicator',
    power: 'power'
};

DSMR_MESSAGE_END_REGEX = /![0-9a-fA-F]{4}\n$/;

class DsrmMessageParser {

    static parse(msg) {
        const rows = msg.split('\n');
        const results = rows.filter(row => row.length > 0)
            .map(parseRow)
            .filter(row => row);
        //todo reduce values to a map (key:value)
        console.log({ results: results });
    }

}

function parseRow(row) {
    const parser = OBIS_PARSERS.find(parser => parser.is(row));
    if (parser) {
        return parser.parse(row);
    }
}

class Power {
    static regex = /\(([0-9]*\.[0-9]*)\*kW\)/; // matches '(00.198*kW)'

    static is(str) {
        return str.startsWith(DSMR_OBIS_CODES.power);
    }

    static parse(str) {
        const match = this.regex.exec(str);
        if (match) {
            const value = parseFloat(match[1]) * 1000;
            return { key: DSMR_OBIS_NAMES.power, value };
        }
    }
}

class Timestamp {
    static regex = /\(([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})S\)/; // matches '(210705164046S)'

    static is(str) {
        return str.startsWith(DSMR_OBIS_CODES.timestamp);
    }

    static parse(str) {
        const match = this.regex.exec(str);
        if (match) {
            const value = `20${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`;
            return { key: DSMR_OBIS_NAMES.timestamp, value };
        }
    }
}

class TariffIndicator {
    static regex = /\(([0-9]*)\)/; // matches '(0002)'

    static is(str) {
        return str.startsWith(DSMR_OBIS_CODES.tariffIndicator);
    }

    static parse(str) {
        const match = this.regex.exec(str);
        if (match) {
            const value = parseInt(match[1], 10);
            return { key: DSMR_OBIS_NAMES.tariffIndicator, value };
        }
    }
}

class ReceivedTariff {
    regex = /\(([0-9]*\.[0-9]*)\*kWh\)/; // matches '(002810.380*kWh)'

    constructor(key, property) {
        this.key = key;
        this.property = property;
    }

    is(str) {
        return str.startsWith(this.key);
    }

    parse(str) {
        const match = this.regex.exec(str);
        if (match) {
            const value = parseFloat(match[1]);
            return { key: this.property, value };
        }
    }
}

OBIS_PARSERS = [
    Power,
    Timestamp,
    TariffIndicator,
    new ReceivedTariff(DSMR_OBIS_CODES.receivedTariff1, DSMR_OBIS_NAMES.receivedTariff1),
    new ReceivedTariff(DSMR_OBIS_CODES.receivedTariff2, DSMR_OBIS_NAMES.receivedTariff2)
];

module.exports = { DsrmMessageParser, DSMR_OBIS_NAMES, DSMR_MESSAGE_END_REGEX };
