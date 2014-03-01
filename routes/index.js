var Member = require('../models/Member.js');

exports.index = function(req, res){
	var member = new Member({});
	member.findAll(function (err, docs) {
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
	var member = new Member({});
	member.email = req.params.email;
	member.findOneByEmail(function (err, docs) {
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
					member: member
				});
			}
		}
	});
};

exports.update = function(req, res){
	var member = new Member({});
	member.email = req.params.email;
	member.name = req.body.name;
	member.update(function (err) {
		if (err) {
			req.session.error = "update filed!";
			res.redirect('/');
		} else {
			req.session.success = "update succeed!";
			res.redirect('/detail/'+member.email);
		}
	});
};

exports.delete = function(req, res){
	var member = new Member({});
	member.email = req.params.email;
	member.delete(function (err, count) {
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
	var member = new Member({});
	member.email = email;
	member.name = req.body.name;
	member.balance = parseInt(req.body.initial);
	member.findOneByEmail(function (err, docs) {
		console.log(docs);
		if (docs) {
			req.session.error = "this email has already been added!";
			res.redirect('/');
		} else {
			member.insert(function (err, docs) {
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
