/*
 * GET home page.
 */

exports.assistant = function(req, res){
  res.render('dashboard', { 
    title: 'Express'
  });
};

