var Member = require('../models/Member.js');

exports.index = function(req, res){
	Member.findAll(function (err, docs) {
		if (err) {
			req.session.error = "something wrong!";
			res.redirect('/');
		} else {
			res.render('index', {
				title: 'AA',
				members: docs
			});
		}
	});
};

exports.detail = function(req, res){
	Member.findOneByEmail(req.params.email, function (err, docs) {
		if (err) {
			req.session.error = "something wrong!";
			res.redirect('/');
		} else {
			if (!docs) {
				req.session.error = "no such member!";
				res.redirect('/');
			} else {
				res.render('detail', {
					title: "Detail",
					member: docs
				});
			}
		}
	});
};

exports.update = function(req, res){
	var member = {
		email: req.params.email,
		name: req.body.name
	}
	Member.update(member, function (err) {
		if (err) {
			req.session.error = "update filed!";
			res.redirect('/');
		} else {
			req.session.success = "update succeed!";
			res.redirect('/');
		}
	});
};

exports.delete = function(req, res){
	Member.deleteByEmail(req.params.email, function (err, count) {
		if (err) {
			req.session.error = "delete failed!";
			res.redirect('/');
		} else {
			req.session.succeed = "already deleted!";
			res.redirect('/');
		}
	})
};

exports.charge = function(req, res){
	res.render('detail', { title: 'Detail' });
};

exports.add = function(req, res){
	res.render('add', { title: 'Add' });
};

exports.doAdd = function(req, res){
	var email = req.body.email.match("[a-z0-9]+");
	var member = {
		email: email,
		name: req.body.name,
		balance: parseInt(req.body.initial)
	};

	Member.findOneByEmail(email, function (err, docs) {
		if (docs) {
			req.session.error = "this email has already been added!";
			res.redirect('/');
		} else {
			Member.insert(member, function (err, docs) {
				if (err) {
					req.session.error = "add failed";
					res.redirect('/');
				} else {
					req.session.succeed = "add succeed!";
					res.redirect('/');
				}
			});
		}
	});
};
