let express = require('express');
let router = express.Router();
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const agentModel = require('../../models/agents.model');
const helper = require('../../utilities/helper');
const constants = require('../../utilities/constants');
const mongoose = require('mongoose');
router.get('/', helper.authenticateToken, async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.agentid && mongoose.Types.ObjectId.isValid(req.token.agentid)) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let agentData = await primary.model(constants.MODELS.agents, agentModel).findById(req.token.agentid).select('-password').lean();
        if (agentData && agentData.status == true && agentData.is_approved == true && agentData.mobileverified == true) {
            return responseManager.onSuccess('Agent profile!', agentData, res);
        } else {
            return responseManager.badrequest({ message: 'Invalid agentid to get agent profile, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get agent profile, please try again' }, res);
    }
});
router.post('/', helper.authenticateToken, async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { name, profilepic } = req.body;
    if (req.token.agentid && mongoose.Types.ObjectId.isValid(req.token.agentid)) {
        if (name && name.trim() != '') {
            let primary = mongoConnection.useDb(constants.DEAFULT_DB);
            let agentData = await primary.model(constants.MODELS.agents, agentModel).findById(req.token.agentid).select('-password').lean();
            if (agentData && agentData.status == true && agentData.is_approved == true && agentData.mobileverified == true) {
                let obj = {
                    name: name,
                    profilepic: profilepic,
                    updatedBy: new mongoose.Types.ObjectId(req.token.agentid)
                };
                await primary.model(constants.MODELS.agents, agentModel).findByIdAndUpdate(req.token.agentid, obj);
                let updatedagentData = await primary.model(constants.MODELS.agents, agentModel).findById(req.token.agentid).select('-password').lean();
                return responseManager.onSuccess('Agent profile updated successfully!', updatedagentData, res);
            } else {
                return responseManager.badrequest({ message: 'Invalid agentid to set agent profile, please try again' }, res);
            }
        }else{
            return responseManager.badrequest({ message: 'Invalid name to update profile, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to update agent profile, please try again' }, res);
    }
});
router.post('/changepassword', helper.authenticateToken, async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { oldpassword, password } = req.body;
    if (req.token.agentid && mongoose.Types.ObjectId.isValid(req.token.agentid)) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let agentData = await primary.model(constants.MODELS.agents, agentModel).findById(req.token.agentid).lean();
        if (agentData && agentData.status == true && agentData.is_approved == true && agentData.mobileverified == true) {
            let decPassword = await helper.passwordDecryptor(agentData.password);
            if (decPassword == oldpassword) {
                let newEncPassword = await helper.passwordEncryptor(password);
                await primary.model(constants.MODELS.agents, agentModel).findByIdAndUpdate(req.token.agentid, { password: newEncPassword });
                return responseManager.onSuccess('Agent password updated successfully!', 1, res);
            } else {
                return responseManager.badrequest({ message: 'Password does not match, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid agentid to update agent password, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to update agent password, please try again' }, res);
    }
});
module.exports = router;