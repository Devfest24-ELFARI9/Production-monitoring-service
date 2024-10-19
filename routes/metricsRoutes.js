const express = require('express');
const { getCarsPerDay, checkPerformance } = require('../controllers/metricsController');
const router = express.Router();

router.get('/metrics/cars-per-day', getCarsPerDay);
router.get('/metrics/check-performance', checkPerformance);

module.exports = router;
