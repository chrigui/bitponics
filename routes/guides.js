module.exports = function(app){
	app.get('/guides/water-culture-system', function (req, res){
	  //print_visits(req, res);
	  res.render('guides/waterculturesystem', {
	    title: "Bitponics Water Culture System",
    	className: "guides water-culture-system"
	  });

	});
};