var app = require('../app'),
    winston = require('winston');

module.exports = function(){
  
  // https://github.com/visionmedia/express/blob/master/examples/error-pages/index.js

  app.use(function(req, res, next){
    res.status(404);
    winston.info('404\'ed');
    // respond with html page
    if (req.accepts('html')) {
      res.render('404', { url: req.url });
      return;
    }

    // respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not found' });
      return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
  });



  app.use(function(err, req, res, next){
    winston.info('In the error middleware');
    winston.error(err);   
    res.status(err.status || 500);
    
    // TODO : vary response type based on Accepts headers
    // TODO : vary the verbosity of response based on environment and/or (admin user+debug param). Careful not to expose sensitive data publicly 
    res.render('500', { error: err });
  });

  // Expose some routes for getting to the error pages

  app.get('/404', function(req, res, next){
    // just call next() to trigger a 404 since no other middleware
    // will match /404 after this one, and we're not
    // responding here
    next();
  });

  app.get('/403', function(req, res, next){
    // trigger a 403 error
    var err = new Error('not allowed!');
    err.status = 403;
    next(err);
  });

  app.get('/500', function(req, res, next){
    // trigger a generic (500) error
    next(new Error('keyboard cat!'));
  });
}