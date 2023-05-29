const advertisementModel = require('../../../models/advertisements.model');
const organizerModel = require('../../../models/organizers.model');
const responseManager = require('../../../utilities/response.manager');
const mongoConnection = require('../../../utilities/connections');
const constants = require('../../../utilities/constants');
const mongoose = require('mongoose');
exports.scheduleadvertisement = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.organizerid && mongoose.Types.ObjectId.isValid(req.token.organizerid)) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        const { advertisementid, schedules } = req.body;
        let organizerData = await primary.model(constants.MODELS.organizers, organizerModel).findById(req.token.organizerid).lean();
        if (organizerData && organizerData.status == true && organizerData.mobileverified == true) {
            if (advertisementid && advertisementid != '' && mongoose.Types.ObjectId.isValid(advertisementid)) {
                let advertisementData = await primary.model(constants.MODELS.advertisements, advertisementModel).findById(advertisementid).lean();
                if (advertisementData && advertisementData.iseditable == true) {
                    (async () => {
                        await primary.model(constants.MODELS.advertisements, advertisementModel).findByIdAndUpdate(advertisementid, { updatedBy: new mongoose.Types.ObjectId(req.token.organizerid), schedules: schedules });
                        let updatedData = primary.model(constants.MODELS.advertisements, advertisementModel).findById(advertisementid).lean();
                        if (updatedData && updatedData != null) {
                            return responseManager.onSuccess('Organizer advertisement schedule created successfully!', { _id: updatedData.schedules }, res);
                        } else {
                            return responseManager.badrequest({ message: 'Invalid advertisement id to update schedule, please try again' }, res);
                        }
                    })().catch((error) => {
                        return responseManager.onError(error, res);
                    });
                } else {
                    return responseManager.badrequest({ message: 'Invalid advertisement id to get schedule, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid advertisement id to update schedule, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid organizer id to update schedule, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to create or update advertisement, please try again' }, res);
    }
}
exports.getschedule = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.organizerid && mongoose.Types.ObjectId.isValid(req.token.organizerid)) {
        const { advertisementid } = req.body;
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let organizerData = await primary.model(constants.MODELS.organizers, organizerModel).findById(req.token.organizerid).lean();
        if (organizerData && organizerData.status == true && organizerData.mobileverified == true) {
            if (advertisementid && advertisementid != '' && mongoose.Types.ObjectId.isValid(advertisementid)) {
                let advertisementData = await primary.model(constants.MODELS.advertisements, advertisementModel).findById(advertisementid).lean();
                if (advertisementData && advertisementData != null) {
                    return responseManager.onSuccess('Organizer schedule data!', { _id: advertisementData._id, schedules: advertisementData.schedules}, res);
                } else {
                    return responseManager.badrequest({ message: 'Invalid advertisement id get schedule data, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid advertisement id to get schedule, please try again' }, res);
            }
        }else{
            return responseManager.badrequest({ message: 'Invalid organizer id to get schedule, please try again' }, res);
        }
    }else{
        return responseManager.badrequest({ message: 'Invalid token to get schedule, please try again' }, res);
    }
}