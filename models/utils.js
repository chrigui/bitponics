var Device = require('./device'),
DeviceModel = Device.model,
DeviceUtils = Device.utils,
GrowPlanInstanceModel = require('./growPlanInstance').model,
GrowPlanModel = require('./growPlan').model,
PhaseModel = require('./phase').model,
Action = require('./action'),
ActionModel = Action.model,
ActionUtils = Action.utils,
SensorModel = require('./sensor').model,
SensorLogModel = require('./sensorLog').model,
winston = require('winston'),
async = require('async');


module.exports = {
	
	/**
	 * logSensorLog : Log a sensorLog to the sensorLog collection as well as the
	 * device.recentSensorLogs & growPlanInstance.recentSensorLogs. Verify against
	 * IdealRanges and trigger Actions if necessary.
	 *
	 * @param pendingSensorLog : object in a format matching SensorLogSchema. gpid is optional, and if omitted, the log will only be logged to 
	 *		  the device's recentSensorLogs
	 * @param growPlanInstance : GrowPlanInstance model instance on which to log this to recentSensorLogs
	 * @param device : optional. Device Model instance on which to log this to recentSensorLogs
	 */
	 logSensorLog: function(pendingSensorLog, growPlanInstance, device, callback){

	 	pendingSensorLog.gpi = growPlanInstance._id;
		// TODO : also use this opportunity to check if any IdealRanges have been exceeded.
        // if so, trigger the corresponding action 
        // On the gpi: add to actionLogs
        // On the device: expire activeActions and activeActionOverrides. Maybe refresh their deviceMessages at this point?

	 	async.parallel(
 		[
	 		function parallel1(innerCallback){
	 			if (!device){ return innerCallback(); }
	 			device.recentSensorLogs.push(pendingSensorLog);
	 			device.save(innerCallback);
	 		},
	 		function parallel2(innerCallback){
	 			growPlanInstance.recentSensorLogs.push(pendingSensorLog);          
	 			growPlanInstance.save(innerCallback);
	 		},
	 		function parallel3(innerCallback){
	 			var sensorLog = new SensorLogModel(pendingSensorLog);
	 			sensorLog.save(innerCallback);
	 		}
 		], 
 		function parallelFinal(err, result){
 			if (err) { return callback(err); }
 			return callback();
 		}
 		);
	},

	/**
	 * Activate a grow plan. If there's a device, update the device's activeGrowPlanInstance property
	 * and remove the device from any other GPI's that are using it. 
	 */
	activateGrowPlanInstance : function(growPlanInstance, callback){
		growPlanInstance.active = true;

		if (!growPlanInstance.device){
			return growPlanInstance.save(callback);
		}
		else {
			DeviceModel.findById(growPlanInstance.device, function(err, deviceResult){
				if (err) { return callback(err); }
				if (!deviceResult){ return callback(new Error('No device found for specified id')); }

				deviceResult.activeGrowPlanInstance = growPlanInstance;

				deviceResult.save(function(err){
					if (err) { return callback(err); }
					return growPlanInstance.save(callback);			
				});
			});

			// TODO : check for other Devices that have activeGrowPlanInstance set to this. do something....
		}
	}
};