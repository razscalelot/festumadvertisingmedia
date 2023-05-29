const advertisementModel = require('../../../models/advertisements.model');
const organizerModel = require('../../../models/organizers.model');
const responseManager = require('../../../utilities/response.manager');
const mongoConnection = require('../../../utilities/connections');
const constants = require('../../../utilities/constants');
const mongoose = require('mongoose');
exports.createadvertisement = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.organizerid && mongoose.Types.ObjectId.isValid(req.token.organizerid)) {
        const { advertisementid, brandlogo, brandname, campaignname, buttonname, clickurl, image, video, videothumb } = req.body;
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let organizerData = await primary.model(constants.MODELS.organizers, organizerModel).findById(req.token.organizerid).lean();
        if (organizerData && organizerData.status == true && organizerData.mobileverified == true) {
            if (advertisementid && advertisementid != '' && mongoose.Types.ObjectId.isValid(advertisementid)) {
                let advertisementData = await primary.model(constants.MODELS.advertisements, advertisementModel).findById(advertisementid).lean();
                if (advertisementData && advertisementData.iseditable == true) {
                    if (brandlogo && brandlogo != '' && brandname && brandname.trim() != '' && campaignname && campaignname.trim() != '' && buttonname && buttonname.trim() != '' && clickurl && clickurl.trim() != '' && (image && image != '' || video && video != '')) {
                        let obj = {
                            brandlogo: brandlogo,
                            brandname: brandname,
                            campaignname: campaignname,
                            buttonname: buttonname,
                            clickurl: clickurl,
                            image: image,
                            video: video,
                            videothumb: videothumb,
                            iseditable: true,
                            updatedBy: new mongoose.Types.ObjectId(req.token.organizerid)
                        };
                        await primary.model(constants.MODELS.advertisements, advertisementModel).findByIdAndUpdate(advertisementid, obj);
                        let updatedData = primary.model(constants.MODELS.advertisements, advertisementModel).findById(advertisementid).lean();
                        if (updatedData && updatedData != null) {
                            return responseManager.onSuccess('Organizer advertisement created successfully!', { _id: updatedData._id, brandlogo: updatedData.brandlogo, brandname: updatedData.brandname, campaignname: updatedData.campaignname, buttonname: updatedData.buttonname, clickurl: updatedData.clickurl, image: updatedData.image, video: updatedData.video, videothumb: updatedData.videothumb }, res);
                        } else {
                            return responseManager.badrequest({ message: 'Invalid advertisement id get advertisement data, please try again' }, res);
                        }
                    }
                } else {
                    return responseManager.badrequest({ message: 'Invalid advertisement brandlogo, brandname, campaignname, buttonname, clickurl, image or video can not be empty, please try again' }, res);
                }
            } else {
                if (brandlogo && brandlogo != '' && brandname && brandname.trim() != '' && campaignname && campaignname.trim() != '' && buttonname && buttonname.trim() != '' && clickurl && clickurl.trim() != '' && (image && image != '' || video && video != '')) {
                    let obj = {
                        brandlogo: brandlogo,
                        brandname: brandname,
                        campaignname: campaignname,
                        buttonname: buttonname,
                        clickurl: clickurl,
                        image: image,
                        video: video,
                        videothumb: videothumb,
                        iseditable: true,
                        createdBy: new mongoose.Types.ObjectId(req.token.organizerid),
                        updatedBy: new mongoose.Types.ObjectId(req.token.organizerid)
                    };
                    let insertedData = await primary.model(constants.MODELS.advertisements, advertisementModel).create(obj);
                    return responseManager.onSuccess('Organizer advertisement created successfully!', insertedData, res);
                } else {
                    return responseManager.badrequest({ message: 'Invalid advertisement brandlogo, brandname, campaignname, buttonname, clickurl, image or video can not be empty, please try again' }, res);
                }
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid organizerid to update advertisement, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to create or update advertisement, please try again' }, res);
    }
}
exports.getadvertisement = async (req, res) =>{
    if (req.token.organizerid && mongoose.Types.ObjectId.isValid(req.token.organizerid)) {
        let primary = mongoConnection.useDb(constants.DEAFULT_DB);
        let organizerData = await primary.model(constants.MODELS.organizers, organizerModel).findById(req.token.organizerid).select('-password').lean();
        if (organizerData && organizerData.status == true && organizerData.mobileverified == true) {
            const { advertisementid } = req.body;
            if (advertisementid && advertisementid != '' && mongoose.Types.ObjectId.isValid(advertisementid)) {
                let advertisementData = await primary.model(constants.MODELS.advertisements, advertisementModel).findById(advertisementid).lean();
                if (advertisementData && advertisementData != null) {
                    return responseManager.onSuccess('Organizer advertisement data!', { _id: advertisementData._id, brandlogo: advertisementData.brandlogo, brandname: advertisementData.brandname, campaignname: advertisementData.campaignname, buttonname: advertisementData.buttonname, clickurl: advertisementData.clickurl, image: advertisementData.image, video: advertisementData.video, videothumb: advertisementData.videothumb }, res);
                } else {
                    return responseManager.badrequest({ message: 'Invalid advertisement id get advertisement data, please try again' }, res);
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid advertisement id get advertisement data, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid organizerid to get advertisement, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get advertisement data, please try again' }, res);
    }
}