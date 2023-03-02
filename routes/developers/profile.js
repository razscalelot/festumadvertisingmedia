let express = require('express');
let router = express.Router();
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const developerModel = require('../../models/developers.model');
const helper = require('../../utilities/helper');
const constants = require('../../utilities/constants');
const mongoose = require('mongoose');
router.get('/', helper.authenticateToken, async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.developerid && mongoose.Types.ObjectId.isValid(req.token.developerid)) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let developerData = await primary.model(constants.MODELS.developers, developerModel).findById(req.token.developerid).select('-password').lean();
        if (developerData && developerData.status == true && developerData.is_approved == true && developerData.mobileverified == true) {
            return responseManager.onSuccess('Developer profile!', developerData, res);
        } else {
            return responseManager.badrequest({ message: 'Invalid developerid to get developer profile, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get developer profile, please try again' }, res);
    }
});
router.post('/', helper.authenticateToken, async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { name, profilepic } = req.body;
    if (req.token.developerid && mongoose.Types.ObjectId.isValid(req.token.developerid)) {
        if (name && name.trim() != '') {
            let primary = mongoConnection.useDb(constants.DEAFULT_DB);
            let developerData = await primary.model(constants.MODELS.developers, developerModel).findById(req.token.developerid).select('-password').lean();
            if (developerData && developerData.status == true && developerData.is_approved == true && developerData.mobileverified == true) {
                let obj = {
                    name: name,
                    profilepic: profilepic,
                    updatedBy: new mongoose.Types.ObjectId(req.token.developerid)
                };
                await primary.model(constants.MODELS.developers, developerModel).findByIdAndUpdate(req.token.developerid, obj);
                let updatedDeveloperData = await primary.model(constants.MODELS.developers, developerModel).findById(req.token.developerid).select('-password').lean();
                return responseManager.onSuccess('Developer profile updated successfully!', updatedDeveloperData, res);
            } else {
                return responseManager.badrequest({ message: 'Invalid developerid to set developer profile, please try again' }, res);
            }
        }else{
            return responseManager.badrequest({ message: 'Invalid name to update profile, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to update developer profile, please try again' }, res);
    }
});
router.post('/changepassword', helper.authenticateToken, async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { oldpassword, password } = req.body;
    if (req.token.developerid && mongoose.Types.ObjectId.isValid(req.token.developerid)) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let developerData = await primary.model(constants.MODELS.developers, developerModel).findById(req.token.developerid).lean();
        if (developerData && developerData.status == true && developerData.is_approved == true && developerData.mobileverified == true) {
            let decPassword = await helper.passwordDecryptor(developerData.password);
            if (decPassword == oldpassword) {
                let newEncPassword = await helper.passwordEncryptor(password);
                await primary.model(constants.MODELS.developers, developerModel).findByIdAndUpdate(req.token.developerid, { password: newEncPassword });
                return responseManager.onSuccess('Developer password updated successfully!', 1, res);
            } else {
                return responseManager.badrequest({ message: 'Password does not match, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid developerid to update developer password, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to update developer password, please try again' }, res);
    }
});
module.exports = router;