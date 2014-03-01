var settings = require('../settings.js');

var mongod_path = 'mongodb://'+settings.host+':'+settings.port+'/'+settings.db;
var member_collection = settings.member_collection;

function Member (member) {
  this.email = member.email || "";//without @baidu.com
  this.name = member.name || "";
  this.balance = member.balance || 0;
};
module.exports = Member;

Member.prototype.insert = function(callback) {
  var member = {
    email: this.email,
    name: this.name,
    balance: this.balance
  };
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(member_collection);
    collection.insert(member, {w:1}, function(err, docs) {
      db.close();
      if (docs) {
        callback(err, docs);
      } else {
        callback(err, null);
      }
    });
  });
};

Member.prototype.update = function(callback) {
  var member = {
    email: this.email,
    name: this.name,
    balance: this.balance
  };
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(member_collection);
    collection.update({email: member.email}, {$set: {name: member.name}}, {w:1}, function(err) {
      db.close();
      if (err) callback(err);
      else callback(null);
    });
  });
};

Member.prototype.delete = function(callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(member_collection);
    collection.remove({email: this.email}, function(err, count) {
      db.close();
      if (count = 1) {
        callback(err, true);
      } else {
        callback(err, false);
      }
    });
  });
};

Member.prototype.findAll = function(callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(member_collection);
    collection.find().toArray(function(err, docs) {
      db.close();
      if (docs) {
        callback(err, docs);
      } else {
        callback(err, null);
      }
    });
  });
};

Member.prototype.findOneByEmail = function(callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(member_collection);
    collection.findOne({email: this.email}, function(err, docs) {
      db.close();
      if (docs) {
        callback(err, docs);
      } else {
        callback(err, null);
      }
    });
  });
};
