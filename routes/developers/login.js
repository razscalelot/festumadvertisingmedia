let express = require('express');
let router = express.Router();
const mongoConnection = require('../../utilities/connections');
const responseManager = require('../../utilities/response.manager');
const developerModel = require('../../models/developers.model');
const helper = require('../../utilities/helper');
const constants = require('../../utilities/constants');
router.post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { user_type, mobile, password } = req.body;
    if (mobile && mobile.length == 10 && password && password.length >= 6){
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let developerData = await primary.model(constants.MODELS.developers, developerModel).findOne({mobile: mobile, is_approved: true, status: true, mobileverified: true}).lean();
        if (developerData && developerData != null && user_type == developerData.user_type){
            let decPassword = await helper.passwordDecryptor(developerData.password);
            if (decPassword == password){
                let accessToken = await helper.generateAccessToken({developerid: developerData._id.toString()});
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