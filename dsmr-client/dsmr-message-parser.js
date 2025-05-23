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

DSMR_MESSAGE_END_REGEX = /![0-9a-fA-F]{4}/;

class DsmrMessageParser {

    static parse(msg) {
        return msg.split('\n')
            // filter out empty rows
            .filter(row => row.length > 0)
            // parse name and value from row
            .map(parseRow)
            // filter out rows that cannot parsed
            .filter(row => row)
            // collect values in data object
            .reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});
    }

}

function parseRow(row) {
    const parser = OBIS_PARSERS.find(parser => parser.is(row));
    if (parser) {
        return parser.parse(row);
    }
}

class ObisParser {
    constructor(parserConfig) {
        this.config = parserConfig;
    }

    is(str) {
        return str.startsWith(this.config.key);
    }

    parse(str) {
        const match = this.config.matcher.exec(str);
        if (match) {
            const value = this.config.parseValue(match);
            return { key: this.config.name, value };
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

const power = new ObisParser({
    key: DSMR_OBIS_CODES.power,
    name: DSMR_OBIS_NAMES.power,
    matcher: /\(([0-9]*\.[0-9]*)\*kW\)/, // matches '(00.198*kW)'
    parseValue: match => parseFloat(match[1]) * 1000
});

const timestamp = new ObisParser({
    key: DSMR_OBIS_CODES.timestamp,
    name: DSMR_OBIS_NAMES.timestamp,
    matcher: /\(([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})[SW]{1}\)/, // matches '(210705164046S and ...W when winter time is active)'
    parseValue: match => new Date(`20${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`)
});

const tariffIndicator = new ObisParser({
    key: DSMR_OBIS_CODES.tariffIndicator,
    name: DSMR_OBIS_NAMES.tariffIndicator,
    matcher: /\(([0-9]*)\)/, // matches '(0002)'
    parseValue: match => `${parseInt(match[1], 10)}`
});

const receivedTariff1 = new ReceivedTariff(DSMR_OBIS_CODES.receivedTariff1, DSMR_OBIS_NAMES.receivedTariff1);

const receivedTariff2 = new ReceivedTariff(DSMR_OBIS_CODES.receivedTariff2, DSMR_OBIS_NAMES.receivedTariff2);

OBIS_PARSERS = [
    power,
    timestamp,
    tariffIndicator,
    receivedTariff1,
    receivedTariff2
];

module.exports = { DsmrMessageParser, DSMR_OBIS_NAMES, DSMR_MESSAGE_END_REGEX };
