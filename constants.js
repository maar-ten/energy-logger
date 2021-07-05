module.exports.DSMR_OBIS_KEYS = {
    timestamp: '0-0:1.0.0',
    receivedTariff1: '1-0:1.8.1',
    receivedTariff2: '1-0:1.8.2',
    tariffIndicator: '0-0:96.14.0',
    power: '1-0:1.7.0'
};

module.exports.DSMR_OBIS_REGEX = {
    power: /1-0:1\.7\.0\(([0-9]*\.[0-9]*)\*kW\)/,
    timestamp: /([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/,
    messageEnd: /![0-9a-fA-F]{4}\n$/
}

module.exports.PARSER_POWER = class {
    key = '1-0:1.7.0';
    regex = /1-0:1\.7\.0\(([0-9]*\.[0-9]*)\*kW\)/;

    is(str) {
        return str.startsWith(this.key);
    }

    parse(str) {
        const match = this.regex.exec(str);
        if (match) {
            return parseFloat(match[1]) * 1000;
        }
    }
}

module.exports.PARSER_TIMESTAMP = class {
    is(str) {
        return str.startsWith(this.DSMR_OBIS_KEYS.timestamp);
    }

    parse(str) {
        const match = DSMR_OBIS_REGEX.timestamp.exec(str);
        if (match) {
            return `20${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`;
        }
    }
}