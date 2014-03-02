var Member = require('../models/Member.js');

exports.index = function(req, res){
	Member.findAll(function (err, docs) {
		if (err) {
			req.session.error = "something wrong!";
			res.redirect('/');
			return ;
		} else {
			if (typeof(req.session.success) != 'undefined') {
				var success = req.session.success;
				req.session.success = null;
			} else {
				var success = null;
			}
			if (typeof(req.session.error) != 'undefined') {
				var error = req.session.error;
				req.session.error = null;
			} else {
				var error = null;
			}
			console.log("success:"+success);
			console.log("error:"+error);
			res.render('index', {
				title: 'AA',
				members: docs,
				success: success,
				error: error
			});
		}
	});
};

exports.detail = function(req, res){
	Member.findOneByEmail(req.params.email, function (err, docs) {
		if (err) {
			req.session.error = "something wrong!";
			res.redirect('/');
			return ;
		} else {
			if (!docs) {
				req.session.error = "no such member!";
				res.redirect('/');
				return ;
			} else {
				if (typeof(req.session.success) != 'undefined') {
					var success = req.session.success;
					req.session.success = null;
				} else {
					var success = "";
				}
				if (typeof(req.session.error) != 'undefined') {
					var error = req.session.error;
					req.session.error = null;
				} else {
					var error = null;
				}
				res.render('detail', {
					title: "Detail",
					member: docs,
					success: success,
					error: error
				});
			}
		}
	});
};

exports.update = function(req, res){
	if (req.body.name == "") {
		req.session.error = "name must be filled!";
		res.redirect("/");
		return ;
	}
	var member = {
		email: req.params.email,
		name: req.body.name
	}
	Member.update(member, function (err) {
		if (err) {
			req.session.error = "update filed!";
			res.redirect('/');
			return ;
		} else {
			req.session.success = "update succeed!";
			res.redirect('/');
			return ;
		}
	});
};

exports.delete = function(req, res){
	Member.deleteByEmail(req.params.email, function (err, count) {
		if (err) {
			req.session.error = "delete failed!";
			res.redirect('/');
			return ;
		} else {
			req.session.succeed = "already deleted!";
			res.redirect('/');
			return ;
		}
	})
};

exports.charge = function(req, res){
	if (req.body.members.length == 0) {
		req.session.error = "no members?";
		res.send({error: "no members"});
		return ;
	}
	if (req.body.payer == "") {
		req.session.error = "no one paid the money?";
		res.send({error: "no one paid the money"});
		return ;
	}
	if (req.body.money == "") {
		req.session.error = "how much do you paid?";
		res.send({error: "how much do you paid?"});
		return ;
	}

	var members = req.body.members;
	var payer = req.body.payer;
	var money = parseInt(req.body.money);
	var minus = money/members.length;
	for (var i = members.length - 1; i >= 0; i--) {
		Member.updateBalanceByEmail(members[i], -minus, function (err) {
			if (err) {
				req.session.error = "update failed";
			}
		});
	};
	Member.updateBalanceByEmail(payer, money, function (err) {
		if (err) {
			req.session.error = "update failed";
		} else {
			req.session.succeed = "charge succeed!";
		}
	});
	res.send({success: "success"});
	return ;
};

exports.add = function(req, res){
	if (typeof(req.session.success) != 'undefined') {
		var success = req.session.success;
		req.session.success = null;
	} else {
		var success = "";
	}
	if (typeof(req.session.error) != 'undefined') {
		var error = req.session.error;
		req.session.error = null;
	} else {
		var error = null;
	}
	res.render('add', {
		title: 'Add',
		success: success,
		error: error
	});
};

exports.doAdd = function(req, res){
	var email = req.body.email.match("[a-z0-9]+");
	if (email == "" || req.body.name == "") {
		req.session.error = "something missing!";
		res.redirect("/");
		return ;
	}
	if (req.body.initial == "") {
		var initial = 0;
	} else {
		var initial = parseInt(req.body.initial);
	}
	var member = {
		email: email,
		name: req.body.name,
		balance: initial
	};

	Member.findOneByEmail(email, function (err, docs) {
		if (docs) {
			req.session.error = "this email has already been added!";
			res.redirect('/');
			return ;
		} else {
			Member.insert(member, function (err, docs) {
				if (err) {
					req.session.error = "add failed";
					res.redirect('/');
					return ;
				} else {
					req.session.succeed = "add succeed!";
					res.redirect('/');
					return ;
				}
			});
		}
	});
};
