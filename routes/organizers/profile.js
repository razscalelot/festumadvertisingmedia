let express = require('express');
let router = express.Router();
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const organizerModel = require('../../models/organizers.model');
const helper = require('../../utilities/helper');
const constants = require('../../utilities/constants');
const mongoose = require('mongoose');
router.get('/', helper.authenticateToken, async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.organizerid && mongoose.Types.ObjectId.isValid(req.token.organizerid)) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let organizerData = await primary.model(constants.MODELS.organizers, organizerModel).findById(req.token.organizerid).select('-password').lean();
        if (organizerData && organizerData.status == true && organizerData.is_approved == true && organizerData.mobileverified == true) {
            return responseManager.onSuccess('Organizer profile!', organizerData, res);
        } else {
            return responseManager.badrequest({ message: 'Invalid organizerid to get organizer profile, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get organizer profile, please try again' }, res);
    }
});
router.post('/', helper.authenticateToken, async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { name, profilepic } = req.body;
    if (req.token.organizerid && mongoose.Types.ObjectId.isValid(req.token.organizerid)) {
        if (name && name.trim() != '') {
            let primary = mongoConnection.useDb(constants.DEAFULT_DB);
            let organizerData = await primary.model(constants.MODELS.organizers, organizerModel).findById(req.token.organizerid).select('-password').lean();
            if (organizerData && organizerData.status == true && organizerData.is_approved == true && organizerData.mobileverified == true) {
                let obj = {
                    name: name,
                    profilepic: profilepic,
                    updatedBy: new mongoose.Types.ObjectId(req.token.organizerid)
                };
                await primary.model(constants.MODELS.organizers, organizerModel).findByIdAndUpdate(req.token.organizerid, obj);
                let updatedOrganizerData = await primary.model(constants.MODELS.organizers, organizerModel).findById(req.token.organizerid).select('-password').lean();
                return responseManager.onSuccess('Organizer profile updated successfully!', updatedOrganizerData, res);
            } else {
                return responseManager.badrequest({ message: 'Invalid organizerid to set organizer profile, please try again' }, res);
            }
        }else{
            return responseManager.badrequest({ message: 'Invalid name to update profile, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to update organizer profile, please try again' }, res);
    }
});
router.post('/changepassword', helper.authenticateToken, async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { oldpassword, password } = req.body;
    if (req.token.organizerid && mongoose.Types.ObjectId.isValid(req.token.organizerid)) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let organizerData = await primary.model(constants.MODELS.organizers, organizerModel).findById(req.token.organizerid).lean();
        if (organizerData && organizerData.status == true && organizerData.is_approved == true && organizerData.mobileverified == true) {
            let decPassword = await helper.passwordDecryptor(organizerData.password);
            if (decPassword == oldpassword) {
                let newEncPassword = await helper.passwordEncryptor(password);
                await primary.model(constants.MODELS.organizers, organizerModel).findByIdAndUpdate(req.token.organizerid, { password: newEncPassword });
                return responseManager.onSuccess('Organizer password updated successfully!', 1, res);
            } else {
                return responseManager.badrequest({ message: 'Password does not match, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid organizerid to update organizer password, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to update organizer password, please try again' }, res);
    }
});
module.exports = router;