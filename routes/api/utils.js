var async = require('async'),
		routeUtils = require('../route-utils.js'),
		requirejs = require('../../lib/requirejs-wrapper'),
    feBeUtils = requirejs('fe-be-utils');

module.exports = {
	
	/**
	 * Attach a GET query handler
	 * 
	 * @param {Model} options.model
	 * @param {Model=} [options.parentModel]
	 * @param {string=} [options.parentModelFieldName = "ref.documentId"] - if parentModel is defined, used to query for parent id. 
	 * @param {string=} [options.dateFieldName] - document field to use for start-date/end-date query filters
	 * @param {string=} [options.defaultSort]  "fieldName" for ascending or "-fieldName" for descending
	 * 
	 * @return {[function(req, res, next)]}
	 * 
	 * Request:
	 * @param {Date} [req.params.start-date] (optional) Should be something parse-able by moment.js
   * @param {Date} [req.params.end-date] (optional) Should be something parse-able by moment.js
   * @param {Number} [req.params.skip]
   * @param {Number} [req.params.limit=200]
   * @param {string=} [req.params.sort]
   *
   * Response:
   * @param {Array[model]} data
   * @param {Number} count
   * @param {Number} skip
   * @param {Number} limit
	 */
 	query : function(options){
	 	
	 	var Model = options.model,
	 		ParentModel = options.parentModel, 
	 		parentModelFieldName = options.parentModelFieldName;

	 	
	 	return [
	 		routeUtils.middleware.ensureLoggedIn,
	 		function(req, res, next){
		 		var response = {
		 			statusCode : 200,
		 			body : {}
		 		},
		 		startDate = req.query['start-date'],
		    endDate = req.query['end-date'],
		    limit = req.query['limit'] || 200,
		    skip = req.query['skip'],
		    query;

		 		async.series([
					function checkIfParentModel(innerCallback){
						if (!ParentModel){ return innerCallback(); }

		 			ParentModel.findById(req.params.id)
			 			.select('owner users createdBy visibility')
			 			.exec(function(err, parentModelResult){
			 				if (!routeUtils.checkResourceReadAccess(parentModelResult, req.user)){
				        response = {
				        	statusCode : 401,
				        	body : "The parent resource is private and only the owner may access its data."
				        }
				      } 
			        return innerCallback();
			 			});
			 		},
					function countResults(innerCallback){
						if (response.statusCode !== 200){
							return innerCallback();
						}

		        query = Model.find();

		        if (ParentModel){
		        	var parentQuery = {};
		        	//ParentModel.collection.name;
		        	if (parentModelFieldName){
		        		parentQuery[parentModelFieldName] = req.params.id;	
		        	} else {
		        		parentQuery["ref.documentId"] = req.params.id;
		        	}
		        	query.where(parentQuery);
		      	}

			      // cap the limit at 200
			      if (limit > 200) { limit = 200; }

			      
			      // TODO : Localize start/end date based on owner's timezone if there's no tz embedded in the date?
			      if (startDate){
			        startDate = moment(startDate).toDate();
			        query.where('date').gte(startDate);
			      }
			      if (endDate){
			        endDate = moment(endDate).toDate();
			        query.where('date').lt(endDate);
			      }


			      query.count(function(err, count){
			      	response.body.count = count;

			      	return innerCallback(err);
			      });
					},
					function getResults(innerCallback){
						// Cast the query back to a find() operation so we can limit/skip/sort/select.
						// TODO: Should keep the prior .where filters, but need to verify
        		query.find();

						query.limit(limit);
						if (skip){
							query.skip(skip);
						}

						query.sort('-date');

						query.exec(function(err, queryResults){
							if (err){ return innerCallback(err); }

							response.body.data = queryResults;
							response.body.limit = limit;
							response.body.skip = skip;

							return innerCallback();
						});
					}
				], function seriesEnd(err, result){
					if (err) { return next(err); }

					return routeUtils.sendJSONResponse(res, response.statusCode, response.body);
				});
			}
	 	];
 	},

 
	get: function(Model, ParentModel){
		return function(req, res, next){

		};
	},


 	save : function(Model, ParentModel){
 		return function(req, res, next){

 		};
 	},

 

 	delete: function(Model, ParentModel){
 		return function(req, res, next){

 		}
	},


	/**
	 * Upload a photo and associate it to the referenced document
	 * 
	 * @param {Model=} [options.ref]
	 * @param {string=} [options.parentModelFieldName] - must be defined if parentModel is defined
	 * @param {string=} [options.dateFieldName] - document field to use for start-date/end-date query filters
	 * @param {string=} [options.defaultSort]  "fieldName" for ascending or "-fieldName" for descending
	 * 
	 * @return {[function(req, res, next)]}
	 * 
	 */
	photoPost : function(options){
		var ReferenceModel = options.refModel;

		return function(req, res, next){
	    ReferenceModel.findById(req.params.id)
	    .exec(function (err, refModelResult) {
	      if (err) { return next(err); }
	      if (!refModelResult){ return next(new Error('Invalid reference resource'));}
	      
	      if (!routeUtils.checkResourceModifyAccess(refModelResult, req.user)){
	        return res.send(401, "Inadequate permissions to modify the resource.");
	      }

	      // prepare the req.body to have the props expected of routeUtils.processPhotoUpload
	      req.body.ref = {
	      	collectionName : ReferenceModel.collection.name,
	      	documentId : req.params.id
      	};

	      // Unless otherwise specified, photo should use same visibility settings as reference, with public as default
	      req.body.visibility = req.body.visibility || refModelResult.visibility || feBeUtils.VISIBILITY_OPTIONS.PUBLIC;

	      return routeUtils.processPhotoUpload(req, res, next);
	    });
	  }
	}
};


	
