var Member = require('../models/Member.js');
var BackupDB = require('../models/BackupDB.js');
var nodemailer = require("nodemailer");
// var exec = require('child_process').exec;

exports.index = function(req, res){
	Member.findAll(function (err, members) {
		if (err) {
			req.session.error = "something wrong!";
			return res.redirect('/');
		} else {
			BackupDB.findAllBackup(function (err, backups) {
				if (err) {
					req.session.error = "something wrong!";
					return res.redirect('/');
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
					// var zen = "";
					// cmd = 'curl https://api.github.com/zen';
					// exec(cmd, function callback(error, stdout, stderr) {
					// 	zen = stdout;
					res.render('index', {
						title: 'AA',
						members: members,
						backups: backups,
						// zen: zen,
						success: success,
						error: error
					});
					// });
				}
			});
		}
	});
};

exports.detail = function(req, res){
	Member.findOneByEmail(req.params.email, function (err, docs) {
		if (err) {
			req.session.error = "something wrong!";
			return res.redirect('/');
		} else {
			if (!docs) {
				req.session.error = "no such member!";
				return res.redirect('/');
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
		return res.redirect("/");
	}
	var member = {
		email: req.params.email,
		name: req.body.name
	}
	Member.update(member, function (err) {
		if (err) {
			req.session.error = "update filed!";
			return res.redirect('/');
		} else {
			req.session.success = "update succeed!";
			return res.redirect('/');
		}
	});
};

exports.delete = function(req, res){
	Member.deleteByEmail(req.params.email, function (err, count) {
		if (err) {
			req.session.error = "delete failed!";
			return res.redirect('/');
		} else {
			req.session.succeed = "already deleted!";
			return res.redirect('/');
		}
	})
};

exports.charge = function(req, res){
	if (req.body.members.length == 0) {
		req.session.error = "no members?";
		return res.send({error: "no members"});
	}
	if (req.body.payer == "") {
		req.session.error = "no one paid the money?";
		return res.send({error: "no one paid the money"});
	}
	if (req.body.money == "") {
		req.session.error = "how much do you paid?";
		return res.send({error: "how much do you paid?"});
	}

	backupDB(function (err) {
		if (err) {
			req.session.err = "backup database failed!";
			return res.send({error: "backup database failed!"});
		} else {
			var members = req.body.members;
			var payer = req.body.payer;
			var money = parseInt(req.body.money);
			var minus = money/members.length;
			for (var i = members.length - 1; i >= 0; i--) {
				Member.updateBalanceByEmail(members[i], -minus, function (err) {
					if (err) {
						req.session.error = "update failed";
						return res.send({error: "update failed"});
					}
				});
			};
			Member.updateBalanceByEmail(payer, money, function (err) {
				if (err) {
					req.session.error = "update failed";
					return res.send({error: "update failed"});
				} else {
					req.session.success = "charge succeed!";
				}
			});
			//send email
			var mailTo = "";
			for (var i = members.length - 1; i >= 0; i--) {
				if (i == members.length-1)
					mailTo += members[i]+"@baidu.com"
				else
					mailTo += ", "+members[i]+"@baidu.com";
			};
			Member.findNameByEmail(payer, function (err, name) {
				var payerName = name;
				var mailHtml = "<h3>"+payerName+"付了"+money+"元</h3>";
				mailHtml += "<h5>一起吃的有：";
				var count = 0;
				addName(members[count]);
				function addName (email) {
					Member.findNameByEmail(email, function (err, name) {
						if (count == 0) {
							mailHtml += name;
						} else {
							mailHtml += ", "+name;
						}
						count++;
						if (count == members.length) {
							mailHtml += "</h5>";
							mailHtml += "<br />";
							mailHtml += "<h5>现在的余额顺序：</h5>";
							Member.getSortedMembers(function (err, docs) {
								for (var i = 0; i < docs.length; i++) {
									mailHtml += i+1 + ". "+docs[i].name+"&nbsp;&nbsp;&nbsp;&nbsp;&yen;&nbsp;"+Math.round(docs[i].balance*1000000)/1000000+"<br />";
								};
								var transport = nodemailer.createTransport("SMTP", {
									host: "hotswap-in.baidu.com"
								});
								var mailOptions = {
								    from: "se-sh@baidu.com",
								    to: mailTo,
								    headers: "MIME-Version: 1.0\r\nContent-type:text/html;charset=gb2312\r\n",
								    subject: payerName+"付了"+money+"元",
								    html: mailHtml
								};
								transport.sendMail(mailOptions, function(error, response){
								    transport.close();
								    if(error){
								    	req.session.error = "sending email wrong!";
										return res.send({error: "sending email wrong!"});
								    } else {
								    	req.session.success = "charge succeed!";
										return res.send({success: "charge succeed!"});
								    }
								});
								return;
							});
						} else {
							addName(members[count]);
						}
					});
				}
			});
		}
	});
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
		return res.redirect("/");
	}
	if (req.body.initial == "") {
		var initial = 0;
	} else {
		var initial = parseFloat(req.body.initial);
	}
	var member = {
		email: email,
		name: req.body.name,
		balance: initial
	};

	Member.findOneByEmail(email, function (err, docs) {
		if (docs) {
			req.session.error = "this email has already been added!";
			return res.redirect('/');
		} else {
			Member.insert(member, function (err, docs) {
				if (err) {
					req.session.error = "add failed";
					return res.redirect('/');
				} else {
					req.session.succeed = "add succeed!";
					return res.redirect('/');
				}
			});
		}
	});
};

exports.rollback = function (req, res) {
	var time = req.params.time;
	if (time == "") {
		req.session.error = "something missing!";
		return res.send({error: "something missing!"});
	} else {
		BackupDB.findBackupByTime(time, function (err, docs) {
			if (err) {
				req.session.error = "Find backup error!";
				return res.send({error: "Find backup error!"});
			} else {
				if (docs == null) {
					req.session.error = "No such rollback!";
					return res.send({error: "No such rollback!"});
				}
				var members = [];
				for (var i = docs.data.length - 1; i >= 0; i--) {
					members.push(docs.data[i]);
				}
				BackupDB.saveMembers(members, function (err, temp) {
					if (err) {
						req.session.error = "rollback error!";
						return res.send({error: "rollback error!"});
					} else {
						req.session.success = "rollback succeed!   ----- those who added after this backup would not be deleted!";
						return res.send({success: "rollback succeed!   ----- those who added after this backup would not be deleted!"});
					}
				});
			}
		});
	}
}

function backupDB (callback) {
	var date = new Date();
	var time = date.getTime();

	Member.findAll(function (err, docs) {
		if (err) {
			callback(err);
		} else {
			var backup = {
				time: time,
				data: docs
			};
			BackupDB.insertBackup(backup, function (err, docs) {
				if (err) {
					callback(err);
				} else {
					callback(null);
				}
			});
		}
	});
}
