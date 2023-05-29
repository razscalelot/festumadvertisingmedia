var express = require('express');
var router = express.Router();
const helper = require('../../utilities/helper');
const slideCtrl = require('../../controllers/superadmin/slides/create');

router.post('/save', helper.authenticateToken, slideCtrl.createslide);

// router.get('/save', helper.authenticateToken, slideCtrl.getadvertisement);
module.exports = router;