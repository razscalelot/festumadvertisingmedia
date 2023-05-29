let express = require('express');
let router = express.Router();
const mongoConnection = require('../../../utilities/connections');
const responseManager = require('../../../utilities/response.manager');
const superadminModel = require('../../../models/superadmins.model');
const slideModel = require('../../../models/slides.model');
const mongoose = require('mongoose');
const constants = require('../../../utilities/constants');
exports.createslide = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.token.superadminid && mongoose.Types.ObjectId.isValid(req.token.superadminid)) {
        const { slideid, numberofslide, price, numberofusers, time } = req.body;
        if (numberofslide && numberofslide != '' && price && price != '' && numberofusers && numberofusers != '' && time && time != '') {
            let primary = mongoConnection.useDb(constants.DEAFULT_DB);
            let superadminData = await primary.model(constants.MODELS.superadmins, superadminModel).findById(req.token.superadminid).lean();
            if (superadminData && superadminData != null && superadminData.status == true) {
                if (slideid && slideid != '' && mongoose.Types.ObjectId.isValid(slideid)) {
                    let obj = {
                        numberofslide: numberofslide,
                        price: price,
                        numberofusers: numberofusers,
                        time: time,
                        status: true,
                        isavailabel: true,
                        updatedBy: new mongoose.Types.ObjectId(req.token.superadminid)
                    }
                    await primary.model(constants.MODELS.slides, slideModel).findByIdAndUpdate(slideid, obj);
                    let updatedData = await primary.model(constants.MODELS.slides, slideModel).findById(slideid).lean();
                    if (updatedData && updatedData != null) {
                        return responseManager.onSuccess('Slide updated sucecssfully!', updatedData, res);
                    } else {
                        return responseManager.badrequest({ message: 'Invalid slide id get slide data, please try again' }, res);
                    }
                } else {
                    let obj = {
                        numberofslide: numberofslide,
                        price: price,
                        numberofusers: numberofusers,
                        time: time,
                        status: true,
                        isavailabel: true,
                        createdBy: new mongoose.Types.ObjectId(req.token.superadminid),
                        updatedBy: new mongoose.Types.ObjectId(req.token.superadminid),
                    }
                    let insertedData = await primary.model(constants.MODELS.slides, slideModel).create(obj);
                    if (insertedData && insertedData != null) {
                        return responseManager.onSuccess('Slide created sucecssfully!', insertedData, res);
                    } else {
                        return responseManager.badrequest({ message: 'Invalid slide id get slide data, please try again' }, res);
                    }
                }
            } else {
                return responseManager.badrequest({ message: 'Invalid superadminid to update slide, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid slide brandlogo, numberofslide, price, numberofusers, time can not be empty, please try again' }, res);
        }
    } else {
        return responseManager.badrequest({ message: 'Invalid token to get slide data, please try again' }, res);
    }
};