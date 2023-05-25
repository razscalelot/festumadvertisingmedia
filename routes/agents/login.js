let express = require('express');
let router = express.Router();
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const agentModel = require('../../models/agents.model');
const helper = require('../../utilities/helper');
const constants = require('../../utilities/constants');
router.post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { user_type, mobile, password } = req.body;
    if (mobile && mobile.length == 10 && password && password.length >= 6){
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let agentData = await primary.model(constants.MODELS.agents, agentModel).findOne({mobile: mobile, is_approved: true, status: true, mobileverified: true}).lean();
        if (agentData && agentData != null && user_type == agentData.user_type){
            let decPassword = await helper.passwordDecryptor(agentData.password);
            if (decPassword == password){
                let accessToken = await helper.generateAccessToken({agentid: agentData._id.toString()});
                return responseManager.onSuccess('Agent login successfully!', { token: accessToken }, res);
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