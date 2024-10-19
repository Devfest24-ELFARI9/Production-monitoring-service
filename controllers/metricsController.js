const { getCarsProducedPerDay, checkPerformanceIssues } = require('../services/influxService');

exports.getCarsPerDay = async (req, res) => {
  try {
    const data = await getCarsProducedPerDay();
    res.json(data);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.checkPerformance = async (req, res) => {
  try {
    const performanceIssue = await checkPerformanceIssues();
    res.json(performanceIssue);
  } catch (error) {
    console.error('Error checking performance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
