import { fromEvent, interval } from 'rxjs';
import { bufferCount, map, mergeMap, retry, skip, switchMap, take, tap } from 'rxjs/operators';

import { InfluxdbWriter } from './influxdb-writer.js';
import { DsmrMessageParser } from './dsmr-message-parser.js';
import { DsmrClient } from './dsmr-client.js';

const resolvedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log(`Timezone is set to ${resolvedTimezone}`);

const writer = new InfluxdbWriter();

// Emits a value once when InfluxDB is ready to receive data
const influxReadyState$ = interval(2000).pipe(
  // check if InfluxDB is ready
  mergeMap(() => writer.isReady()),

  // complete when InfluxDB is ready
  take(1),

  // log InfluxDB ready state
  tap(() => console.log('InfluxDB is ready')),

  // retry the ready check (an error is thrown when InfluxDB is not ready)
  retry({ count: 10 }),
);

const messages$ = influxReadyState$.pipe(
  // Influx is ready, now switch to collecting data
  switchMap(() => fromEvent(new DsmrClient().listen(), 'data')),

  // skip first message, because it may be incomplete
  skip(1),

  // parse data from the message
  map(DsmrMessageParser.parse),

  // convert to influxdb point
  map(writer.toPoint),

  // buffer data for writing efficiency (60=~1min)
  bufferCount(1)
)

messages$.subscribe({
  next: async (points) => await writer.toInflux(points),
  error: err => console.error(err),
});
