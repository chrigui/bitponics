var app = require('../app');
/*
 * GET home page.
 */
exports.index = function (req, res) {
  res.render('assistant', {
    title: "Bitponics - Dashboard"
  });
};

exports.assistant = function(req, res){
  res.render('assistant', {
    title: "Bitponics - Assistant"
  });
};

