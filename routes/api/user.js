

/**
 * module.exports : function to be immediately invoked when this file is require()'ed 
 * 
 * @param app : app instance. Will have the configs appended to a .config property. 
 */
module.exports = function(app) {
  var UserModel = require('../../models/user')(app).model; //note we must pass (app) to user.js

   //List users
  app.get('/api/user', function (req, res){
    return UserModel.find(function (err, users) {
      if (!err) {
        return res.send(users);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Create single user
   *
   *  Test with:
   *  jQuery.post("/api/user", {
   *    "email" : "test@test.com",
   *    "name" : { "first": "Jim", "last": "Bo" },
   *    "locale": "en_US",
   *    "active" : true
   *  }, function (data, textStatus, jqXHR) {
   *    console.log("Post resposne:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
   *  });
   */
  app.post('/api/user', function (req, res){
    var user;
    console.log("POST: ");
    console.log(req.body);
    user = new UserModel({
      email : req.body.email,
      name : req.body.name,
      locale: req.body.locale,
      active : req.body.active
    });
    user.save(function (err) {
      if (!err) {
        return console.log("created user");
      } else {
        return console.log(err);
      }
    });
    return res.send(user);
  });

  /*
   * Read an user
   *
   * To test:
   * jQuery.get("/api/user/${id}", function(data, textStatus, jqXHR) {
   *     console.log("Get response:");
   *     console.dir(data);
   *     console.log(textStatus);
   *     console.dir(jqXHR);
   * });
   */
  app.get('/api/user/:id', function (req, res){
    return UserModel.findById(req.params.id, function (err, user) {
      if (!err) {
        return res.send(user);
      } else {
        return console.log(err);
      }
    });
  });

  /*
   * Update an user
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/user/${id}",
   *     type: "PUT",
   *     data: {
   *       "actionBelowMin": "actionid"
   *     },
   *     success: function (data, textStatus, jqXHR) {
   *         console.log("Post response:");
   *         console.dir(data);
   *         console.log(textStatus);
   *         console.dir(jqXHR);
   *     }
   * });
   */
  app.put('/api/user/:id', function (req, res){
    return UserModel.findById(req.params.id, function (err, user) {
      user.actionBelowMin = req.body.actionBelowMin;
      return user.save(function (err) {
        if (!err) {
          console.log("updated user");
        } else {
          console.log(err);
        }
        return res.send(user);
      });
    });
  });

  /*
   * Delete an user
   *
   * To test:
   * jQuery.ajax({
   *     url: "/api/user/${id}", 
   *     type: "DELETE",
   *     success: function (data, textStatus, jqXHR) { 
   *         console.log("Post resposne:"); 
   *         console.dir(data); 
   *         console.log(textStatus); 
   *         console.dir(jqXHR); 
   *     }
   * });
   */
  app.delete('/api/user/:id', function (req, res){
    return UserModel.findById(req.params.id, function (err, user) {
      return user.remove(function (err) {
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
