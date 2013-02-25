module.exports = function (app){

  app.get('/index', function (req, res){
    res.redirect('/');
  });

  app.get('/index.php', function (req, res){
    res.redirect('/index');
  });

  app.get('/how', function (req, res){
    res.redirect('/how-it-works');
  });

  app.get('/how.php', function (req, res){
    res.redirect('/how-it-works');
  });

  app.get('/photos', function (req, res){
    res.redirect('/');
  });

  app.get('/photos.php', function (req, res){
    res.redirect('/');
  });

  app.get('/press.php', function (req, res){
    res.redirect('/press');
  });

  app.get('/contact.php', function (req, res){
    res.redirect('/contact');
  });

  app.get('/growplans', function (req, res){
    res.redirect('/grow-plans');
  });
}