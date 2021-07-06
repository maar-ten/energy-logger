const DATABASE_NAME = 'power.db';
const Sqlite = require('better-sqlite3');

module.exports = class DataBase {

    constructor() {
        this.db = new Sqlite(DATABASE_NAME);
        this.insert = this.db.prepare('INSERT INTO power (timestamp, receivedTariff1, receivedTariff2, tariffIndicator, power) VALUES (@timestamp, @receivedTariff1, @receivedTariff2, @tariffIndicator, @power)');
    }

    insert(powerMeterData) {
        this.insert.run(powerMeterData);
    }
}

module.exports = class PowerMeterData {
    constructor(timestamp, receivedTariff1, receivedTariff2, tariffIndicator, power) {
        this.timestamp = timestamp;
        this.receivedTariff1 = receivedTariff1;
        this.receivedTariff2 = receivedTariff2;
        this.tariffIndicator = tariffIndicator;
        this.power = power;
    }
}