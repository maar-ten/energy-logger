const { readFileSync } = require('fs');

const { DsmrMessageParser } = require("./dsmr-message-parser");
const testData = readFileSync('example-dsmr-messages.txt', 'utf8').split('[BREAK]');

describe('DsmrMessageParser', () => {

    test('adds timezone to timestamp', () => {
        const result = DsmrMessageParser.parse(testData[0]);

        expect(result.timestamp).toEqual(new Date('2021-07-05T16:40:46+00:00'));
    });
});