const { writeProductionData } = require('../services/influxService');

const receiveProductionData = async (req, res) => {
  try {
    const { event, machine_id, car_id, timestamp } = req.body;

    if (!event || !machine_id || !car_id || !timestamp) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    await writeProductionData({ event, machine_id, car_id, timestamp });

    if (event === 'defective_product') {
        await influxDBClient.writePoint({
          measurement: 'defects',
          tags: { machine_id, car_id },
          fields: { defective: 1 },
          timestamp
        });
      }

    res.status(200).json({ message: 'Data point received successfully' });
  } catch (error) {
    console.error('Error processing data point:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getDefectiveCarsPerDay = async (req, res) => {
    const { date } = req.query; // date format: YYYY-MM-DD
  
    try {
      const query = `
        from(bucket: "production")
        |> range(start: ${date}T00:00:00Z, stop: ${date}T23:59:59Z)
        |> filter(fn: (r) => r._measurement == "defects")
        |> count()
      `;
  
      const result = await influxDBClient.query(query);
      const count = result.length ? result[0]._value : 0;
  
      res.status(200).json({ date, defective_cars: count });
    } catch (error) {
      console.error('Error querying defective cars:', error);
      res.status(500).json({ error: 'Failed to retrieve defective cars' });
    }
  };

module.exports = { receiveProductionData, getDefectiveCarsPerDay };
