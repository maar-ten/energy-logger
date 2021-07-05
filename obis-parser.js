module.exports = class {

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
    const parser = [Power, Timestamp].find(parser => parser.is(row));
    if (parser) {
        return parser.parse(row);
    }
}

class Power {
    static key = '1-0:1.7.0';
    static regex = /1-0:1\.7\.0\(([0-9]*\.[0-9]*)\*kW\)/;

    static is(str) {
        return str.startsWith(this.key);
    }

    static parse(str) {
        const match = this.regex.exec(str);
        if (match) {
            const value = parseFloat(match[1]) * 1000;
            return { key: 'power', value };
        }
    }
}

class Timestamp {
    static key = '0-0:1.0.0';
    static regex = /([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/;

    static is(str) {
        return str.startsWith(this.key);
    }

    static parse(str) {
        const match = this.regex.exec(str);
        if (match) {
            const value = `20${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`;
            return { key: 'timestamp', value };
        }
    }
}
