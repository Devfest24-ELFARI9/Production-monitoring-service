const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const url = 'http://localhost:8086';
const token = 'your-influxdb-token';
const org = 'your-org';
const bucket = 'production_monitoring';
const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket);
const queryApi = client.getQueryApi(org);

exports.writeProductionData = async ({ event, machine_id, car_id, timestamp }) => {
  const point = new Point('machine_events')
    .tag('machine_id', machine_id)
    .tag('event', event)
    .stringField('car_id', car_id)
    .timestamp(new Date(timestamp));

  writeApi.writePoint(point);
  await writeApi.close();
};

exports.getCarsProducedPerDay = async () => {
  const query = `from(bucket: "${bucket}")
                 |> range(start: -30d)
                 |> filter(fn: (r) => r._measurement == "machine_events" and r.event == "car_departure")
                 |> aggregateWindow(every: 1d, fn: count, createEmpty: false)
                 |> yield(name: "cars_per_day")`;

  let data = [];
  await queryApi.queryRows(query, {
    next: (row, tableMeta) => {
      const obj = tableMeta.toObject(row);
      data.push(obj);
    },
    error: (error) => { throw error; },
    complete: () => console.log('Query completed'),
  });

  return data;
};

exports.checkPerformanceIssues = async () => {
  // Query to get yesterday's production count
  const queryYesterday = `from(bucket: "${bucket}")
                          |> range(start: -2d, stop: -1d)
                          |> filter(fn: (r) => r._measurement == "machine_events" and r.event == "car_departure")
                          |> count()`;

  // Query to get today's production count
  const queryToday = `from(bucket: "${bucket}")
                      |> range(start: -1d)
                      |> filter(fn: (r) => r._measurement == "machine_events" and r.event == "car_departure")
                      |> count()`;

  let carsYesterday = 0;
  let carsToday = 0;

  await queryApi.queryRows(queryYesterday, {
    next: (row, tableMeta) => {
      carsYesterday = tableMeta.toObject(row)._value;
    },
    error: (error) => { throw error; },
  });

  await queryApi.queryRows(queryToday, {
    next: (row, tableMeta) => {
      carsToday = tableMeta.toObject(row)._value;
    },
    error: (error) => { throw error; },
  });

  if (carsToday < carsYesterday) {
    return { alert: true, message: `Performance issue: Production has dropped. Only ${carsToday} cars made today, compared to ${carsYesterday} yesterday.` };
  }

  return { alert: false, message: 'Production is on track.' };
};
