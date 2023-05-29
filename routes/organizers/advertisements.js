var express = require('express');
var router = express.Router();
const helper = require('../../utilities/helper');
const createCtrl = require('../../controllers/organizer/advertisements/create');
const scheduleCtrl = require('../../controllers/organizer/advertisements/schedule');

router.post('/save', helper.authenticateToken, createCtrl.createadvertisement);
router.post('/schedule', helper.authenticateToken, scheduleCtrl.scheduleadvertisement);


router.get('/save', helper.authenticateToken, createCtrl.getadvertisement);
router.get('/schedule', helper.authenticateToken, scheduleCtrl.getschedule);
module.exports = router;