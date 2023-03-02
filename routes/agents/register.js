let express = require('express');
let router = express.Router();
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const helper = require('../../utilities/helper');
const agentModel = require('../../models/agents.model');
const axios = require('axios');
const config = {
    headers: {
        'content-type': 'application/x-www-form-urlencoded'
    }
};
router.post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { name, email, mobile, country_code, password, refer_code, fcm_token } = req.body;
    if (name && name.trim() != '' && email && email.trim() != '' && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) && mobile && mobile.length == 10 && country_code && country_code.trim() != '' && password && password >= 6) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let encPassword = await helper.passwordEncryptor(password);
        let my_referCode = await helper.makeid(6);
        let checkExisting = await primary.model(constants.MODELS.agents, agentModel).findOne({ $or: [{ mobile: mobile }, { email: email }] }).lean();
        if (checkExisting == null) {
            let obj = {
                name: name,
                email: email,
                mobile: mobile,
                country_code: country_code,
                refer_code: refer_code,
                password: encPassword,
                profilepic: null,
                my_refer_code: my_referCode,
                fcm_token: fcm_token,
                is_approved: true,
                status: true,
                mobileverified: true,
            };
            const url = process.env.FACTOR_URL + mobile + "/AUTOGEN";
            let otpSend = await axios.get(url, config);
            if (otpSend.data.Details) {
                obj.otpVerifyKey = otpSend.data.Details;
                await primary.model(constants.MODELS.agents, agentModel).create(obj);
                return responseManager.onSuccess('Agent register successfully!', { key: otpSend.data.Details }, res);
            } else {
                return responseManager.onSuccess('Something went wrong, unable to send otp for given mobile number, please try again!', 0, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid data to register agent, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid data to register agent, please try again' }, res);
    }
});
module.exports = router;