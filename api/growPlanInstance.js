var GrowPlanInstanceModel = require('../models/growPlanInstance').model;

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {

   //List grow_plan_instance
  app.get('/api/grow_plan_instance', function (req, res){
    return GrowPlanInstanceModel.find(function (err, growPlanInstances) {
      if (!err) {
        return res.send(growPlanInstances);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Create single growPlanInstance
   *
   *  Test with:
   *  jQuery.post("/api/grow_plan_instance", {
   *    users : [{ type: ObjectId, ref: 'User'}],
   *    growPlan : { type : ObjectId, ref : 'GrowPlan', required: true},
   *    device : { type : ObjectId, ref : 'Device', required: false },
   *    startDate: { type: Date, required: true },
   *    phases: [{
   *      phase: { type: ObjectId, ref: 'Phase' },
   *      startDate: { type: Date },
   *      endDate: { type: Date },
   *      active: { type: Boolean }
   *    }],
   *    sensorLogs: [{
   *      sensor: { type: ObjectId, ref: 'Sensor', required: true },
   *      value: { type: Number },
   *      timestamp: { type: Date, required: true }
   *    }],
   *    controlLogs: [{
   *      control: { type: ObjectId, ref: 'Control', , required: true },
   *      value: { type: Number },
   *      timestamp: { type: Date, required: true }
   *    }],
   *    photoLogs: [{
   *      url: { type : mongoose.SchemaTypes.Url, required: true},
   *      tags: { type : [String]},
   *      timestamp: { type: Date, required: true }
   *    }],
   *    genericLogs: [{
   *      entry: { type: String, required: true },
   *      tags: { type : [String]},
   *      logType: { type: String },
   *      timestamp: { type: Date, required: true }
   *    }]
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/grow_plan_instance', function (req, res){
    var growPlanInstance;
    console.log("POST: ");
    console.log(req.body);
    growPlanInstance = new GrowPlanInstanceModel({
      users : req.body.users,
      growPlan : req.body.growPlan,
      device : req.body.device,
      startDate: req.body.startDate,
      phases: req.body.phases,
      sensorLogs: req.body.sensorLogs,
      controlLogs: req.body.controlLogs,
      photoLogs: req.body.photoLogs,
      genericLogs: req.body.genericLogs
    });
    growPlanInstance.save(function (err) {
      if (!err) {
        return console.log("created growPlanInstance");
      } else {
        return console.log(err);
      }
    });
    return res.send(growPlanInstance);
  });

  /*
   * Read an growPlanInstance
   *
   * To test:
   * jQuery.get("/api/grow_plan_instance/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/grow_plan_instance/:id', function (req, res){
    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      if (!err) {
        return res.send(growPlanInstance);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Update an growPlanInstance
   *
   * To test:
   * jQuery.put("/api/grow_plan_instance", {
   *   users : ['5035831eb4a6ae33b0000002'],
   *   startDate: 1346009640013,
   *   endDate: 1346010888429,
   *   active: true,
   *   phases: []
   * }, function (data, textStatus, jqXHR) {
   * console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   * });
  */
  app.put('/api/grow_plan_instance/:id', function (req, res){
    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      growPlanInstance.users = req.body.users;
      growPlanInstance.startDate = req.body.startDate;
      growPlanInstance.endDate = req.body.endDate;
      growPlanInstance.active = req.body.active;
      growPlanInstance.phases = req.body.phases;

      return growPlanInstance.save(function (err) {
        if (!err) {
          console.log("updated growPlanInstance");
        } else {
          console.log(err);
        }
        return res.send(growPlanInstance);
      });
    });
  });

  /*
   * Sensor Logs nested
   *
   *   jQuery.ajax({
   *      url: "/api/grow_plan_instance/503a86812e57c70000000001/sensorlog",
   *      type: "PUT",
   *      data: {
   *        sensorLogs: [{
   *          sensor: "503a79426d25620000000001",
   *          value: 25,
   *          timestamp: new Date()
   *        },
   *        {
   *          sensor: "503a79426d25620000000001",
   *          value: 24,
   *          timestamp: new Date()
   *        }
   *        ],
   *      },
   *      success: function (data, textStatus, jqXHR) {
   *          console.log("Post response:");
   *          console.dir(data);
   *          console.log(textStatus);
   *          console.dir(jqXHR);
   *      }
   *  });
   */
  app.put('/api/grow_plan_instance/:id/sensorlog', function (req, res){
    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      return growPlanInstance.save(function (err) {
        if (!err) {
          req.body.sensorLogs.forEach(function(log){
            growPlanInstance.sensorLogs.push(log);
          })
          growPlanInstance.save();
          console.dir(req);
          console.log("logged data to growPlanInstance");
          return res.csv([
            ['endDate', growPlanInstance.endDate]
          ]);
        } else {
          console.log(err);
        }
        return res.send(growPlanInstance);
      });
    });
  });

  /*
   * Delete an growPlanInstance
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/grow_plan_instance/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/grow_plan_instance/:id', function (req, res){
    return GrowPlanInstanceModel.findById(req.params.id, function (err, growPlanInstance) {
      return growPlanInstance.remove(function (err) {
        if (!err) {
          console.log("removed");
          return res.send('');
        } else {
          console.log(err);
        }
      });
    });
  });
};
