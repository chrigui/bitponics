var mongoose = require('mongoose'),
	mongooseTypes = require('mongoose-types'),
  	Schema = mongoose.Schema,
  	useTimestamps = mongooseTypes.useTimestamps,
  	ObjectId = Schema.ObjectId;

var PhaseSchema = new Schema({
	name: { type: String, required: true },
	expectedTimeSpan: { type: Number },
	light: { type: ObjectId, ref: 'Light', required: true },},
	actions: [[ type: ObjectId, ref: 'Action', required: true }],
	safeRangesPerSensor: [
		sensor: { type: ObjectId, ref: 'Sensor', required: true },
		valueRange: { 
			maxNumber: { type: Number, required: true },
			minNumber: { type: Number, required: true }
		},
		applicableTimeSpan: { 
			startTime: { type: Number },
			endTime: { type: Number }
		},
		actionBelowMin: { type: ObjectId, ref: 'Action', required: true },
		actionAboveMax: { type: ObjectId, ref: 'Action', required: true }
	],
});

PhaseSchema.plugin(useTimestamps);

PhaseSchema.suggestions = {
	// 'name': [
	// 	'Brightness',
	// 	'pH',
	// 	'EC (Electrical Connectivity)',
	// 	'TDS (Total Disolved Solids)',
	// 	'Water Temperature',
	// 	'Air Temperature',
	// 	'Humidity',
	// 	'Water Level'
	// ]
}

exports.schema = PhaseSchema;
exports.model = mongoose.model('Phase', PhaseSchema);