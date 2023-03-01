let express = require("express");
let router = express.Router();
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const organizerModel = require('../../models/organizers.model');
const helper = require('../../utilities/helper');
const constants = require('../../utilities/constants');
const mongoose = require('mongoose');
router.post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { mobile, password } = req.body;
    if (mobile && mobile.length == 10 && password && password.length >= 6) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let organizerData = await primary.model(constants.MODELS.organizers, organizerModel).findOne({ mobile: mobile, is_approved: true, status: true, mobileverified: true }).lean();
        if (organizerData && organizerData != null) {
            let decPassword = await helper.passwordDecryptor(organizerData.password);
            if (decPassword == password) {
                let accessToken = await helper.generateAccessToken({ organizerid: organizerData._id.toString() });
                return responseManager.onSuccess('Organizer login successfully!', { token: accessToken }, res);
            }else{
                return responseManager.badrequest({ message: 'Invalid password, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({message : 'Invalid mobile or password please try again'}, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid mobile or password please try again' }, res)
    }
});
module.exports = router;
