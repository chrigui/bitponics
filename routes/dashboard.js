var GrowPlanInstanceModel = require('../models/growPlanInstance').model,
	GrowPlanModel = require('../models/growPlan').model,
	SensorModel = require('../models/sensor').model,
	activeGrowPlans = [], //for now just put all user's grow plans in
	currentGrowPlanInstance = {},
	currentGrowPlanInstanceId = ""; 

module.exports = function(app){
	app.get('/dashboard', function (req, res) {
		currentGrowPlanInstanceId = req.query.id;
		if(req.user.id){

			//find GP instances by this user
			GrowPlanInstanceModel
				.find({ "owner": req.user.id })
				.populate('growPlan')
				//.populate('sensorLogs.logs.sensor')
				.exec(function (err, growPlanInstances) {
			      	if (err) { return next(err); }
				    
			      	//set first GP default to show in dashboard, will match on id if present below
			      	currentGrowPlanInstance = growPlanInstances[0];

			      	//get all GP info's
			      	growPlanInstances.forEach(function(gpi, index){
			      		GrowPlanModel
			      			.findById(gpi.growPlan)
			      			.populate('sensors')//.populate('controls').populate('createdBy').populate('growSystem').populate('nutrients').populate('phases')
			      			.exec(function (err, growPlan) {
			      				if (err) { return next(err); }
			      				gpi.growPlan = growPlan;

			      				//set the grow plan to show in the dashboard
					      		if (gpi.gpid === currentGrowPlanInstanceId) {
					      			currentGrowPlanInstance = gpi;
					      		}

			      				//set the grow plans to show in the select box
			      				//TODO: filter on active grow plans
						      	//activeGrowPlans.push(growPlanInstances);

						      	//TODO: get all sensor info's
						      	// growPlanInstance.forEach(function(sensorLog, index){
						      	// 	GrowPlanModel
						      	// 		.findById(gpi.growPlan)
						      	// 		.exec(function (err, sensor){
									      	
											

										// });
						    //   	});
			      			});

			      			res.render('dashboard', {
						    	title: "Bitponics - Dashboard",
						    	user: req.user,
						    	activeGrowPlans: growPlanInstances,
						    	currentGrowPlanInstance: currentGrowPlanInstance
							});
			      	});

			      	
			    });

		
			
		} else {
			res.redirect('/login');
		}
	});
};

