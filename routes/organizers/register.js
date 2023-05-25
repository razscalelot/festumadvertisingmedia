let express = require("express");
let router = express.Router();
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const constants = require('../../utilities/constants');
const helper = require('../../utilities/helper');
const organizerModel = require('../../models/organizers.model');
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
    if (name && name.trim() != '' && email && email.trim() != '' && (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) && mobile && mobile.length == 10 && country_code && country_code != '' && password && password.length >= 6) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let encPassword = await helper.passwordEncryptor(password);
        let my_referCode = await helper.makeid(6);
        let checkExisting = await primary.model(constants.MODELS.organizers, organizerModel).findOne({ $or: [{ mobile: mobile }, { email: email }] }).lean();
        if (checkExisting == null) {
            let obj = {
                name: name,
                email: email,
                mobile: mobile,
                country_code: country_code,
                password: encPassword,
                profilepic: null,
                refer_code: refer_code,
                my_refer_code: my_referCode,
                fcm_token: fcm_token,
                is_approved: true,
                status: true,
                mobileverified: false,
                user_type: 'organizer'
            };
            // const url = process.env.FACTOR_URL + mobile + "/AUTOGEN";
            // let otpSend = await axios.get(url, config);
            // if (otpSend.data.Details) {
            obj.otpVerifyKey = '1234';
            await primary.model(constants.MODELS.organizers, organizerModel).create(obj);
            return responseManager.onSuccess('Organizer register successfully!', { key: '1234' }, res);
            // } else {
            //     return responseManager.onSuccess('Something went wrong, unable to send otp for given mobile number, please try again!', 0, res);
            // }
        } else {
            return responseManager.badrequest({ message: 'Invalid data to register organizer, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid data to register organizer, please try again' }, res);
    }
});
router.post('/verifyotp', async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    let primary = mongoConnection.useDb(constants.DEAFULT_DB);
    const { mobile, otp, key } = req.body;
    if (mobile && mobile.length == 10 && otp && otp.trim() != '' && otp.length == 4 && key && key.trim() != '') {
        let organizerData = await primary.model(constants.MODELS.organizers, organizerModel).findOne({ mobile: mobile, otpVerifyKey: key }).lean();
        if (organizerData) {
            // const url = process.env.FACTOR_URL + "VERIFY/" + key + "/" + otp;
            // let verifiedOTP = await axios.get(url, config);
            // if (verifiedOTP.data.Status == 'Success') {
            if (otp == '1234' && key == '1234') {
                await primary.model(constants.MODELS.organizers, organizerModel).findByIdAndUpdate(organizerData._id, { mobileverified: true });
                return responseManager.onSuccess('Organizer mobile number verified successfully!', 1, res);
            } else {
                return responseManager.badrequest({ message: 'Invalid OTP, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid data to verify organizer mobile number, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid otp or mobile number to verify organizer mobile number, please try again' }, res);
    }
});
router.post('/forgotpassword', async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { mobile } = req.body;
    if (mobile && mobile.trim() != '' && mobile.length == 10) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let checkExisting = await primary.model(constants.MODELS.organizers, organizerModel).findOne({ mobile: mobile }).lean();
        if (checkExisting) {
            // const url = process.env.FACTOR_URL + mobile + "/AUTOGEN";
            // let otpSend = await axios.get(url, config);
            // if (otpSend.data.Details) {
            await primary.model(constants.MODELS.organizers, organizerModel).findByIdAndUpdate(checkExisting._id, { otpVerifyKey: '1234' });
            return responseManager.onSuccess('Organizer mobile identified and otp sent successfully!', { key: '1234' }, res);
            // } else {
            //     return responseManager.onSuccess('Something went wrong, unable to send otp for given mobile number, please try again!', 0, res);
            // }
        } else {
            return responseManager.badrequest({ message: 'Invalid organizer mobile number, Please try again...' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid mobile number, please try again' }, res);
    }
});
router.post('/changepassword', async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { password, mobile } = req.body;
    if (password && password.trim() != '' && password.length >= 6 && mobile && mobile.length == 10) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let organizerData = await primary.model(constants.MODELS.organizers, organizerModel).findOne({ mobile: mobile }).lean();
        if (organizerData) {
            let encpassword = await helper.passwordEncryptor(password);
            await primary.model(constants.MODELS.organizers, organizerModel).findByIdAndUpdate(organizerData._id, { password: encpassword });
            return responseManager.onSuccess('Organizer password changed successfully!', 1, res);
        } else {
            return responseManager.badrequest({ message: 'Invalid organizer mobile number, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid data to change organizer password, please try again' }, res);
    }
});
module.exports = router;

