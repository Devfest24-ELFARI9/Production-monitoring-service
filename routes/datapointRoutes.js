const express = require('express');
const { receiveProductionData , getDefectiveCarsPerDay } = require('../controllers/datapointController');
const router = express.Router();

router.post('/production-datapoint', receiveProductionData);

router.get('/defects', getDefectiveCarsPerDay);

module.exports = router;
