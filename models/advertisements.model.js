let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let scheduleSchema = new mongoose.Schema({
	placeads: {
		type: String,
		trim: true,
		required: true,
	},
	projectonads: {
		type: String,
		trim: true,
		required: true,
	},
	screenforads: {
		type: String,
		trim: true,
		required: true,
	},
	startdate: {
		type: String,
		trim: true,
		required: true, 
	},
	publishads: {
		type: String,
		trim: true,
		required: true, 
	},
	slideplaceforads: {
		type: mongoose.Types.ObjectId,
        require : true
	}
}) 
let schema = new mongoose.Schema({
	schedules: [scheduleSchema],
	createdBy: {
		type: mongoose.Types.ObjectId,
		default: null
	},
	updatedBy: {
		type: mongoose.Types.ObjectId,
		default: null
	}
}, { timestamps: true, strict: false, autoIndex: true });
schema.plugin(mongoosePaginate);
module.exports = schema;