
/*
 * GET users listing.
 */

exports.list = function(req, res){
	res.send("respond with a resource");
};

exports.login = function(req, res){
	res.render('login.ejs', {
		title: "Login"
	})
};

exports.doLogin = function(req, res){
	res.send("respond with a resource");
};

exports.register = function(req, res){
	res.render('register.ejs', {
		title: "Register"
	})
};

exports.doRegister = function(req, res){
	res.send("respond with a resource");
};

exports.logout = function(req, res){
	res.send("respond with a resource");
};
