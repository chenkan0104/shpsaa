var settings = require('../settings.js');

var mongod_path = 'mongodb://'+settings.host+':'+settings.port+'/'+settings.db;
var member_collection = settings.member_collection;

function Member (member) {
  this.email = member.email;//without @baidu.com
  this.name = member.name;
  this.balance = member.balance;
};
exports.Member = Member;

exports.insert = function(member, callback) {
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

exports.update = function(member, callback) {
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

exports.updateBalanceByEmail = function(email, money, callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(member_collection);
    collection.update({email: email}, {$inc: {balance: money}}, {w:1}, function(err) {
      db.close();
      if (err) callback(err);
      else callback(null);
    });
  });
};

exports.deleteByEmail = function(email, callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(member_collection);
    collection.remove({email: email}, function(err, count) {
      db.close();
      if (count = 1) {
        callback(err, true);
      } else {
        callback(err, false);
      }
    });
  });
};

exports.findAll = function(callback) {
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

exports.findOneByEmail = function(email, callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(member_collection);
    collection.findOne({"email": email}, function(err, docs) {
      db.close();
      if (docs) {
        callback(err, docs);
      } else {
        callback(err, null);
      }
    });
  });
};

exports.findNameByEmail = function (email, callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(member_collection);
    collection.findOne({"email": email}, function(err, docs) {
      db.close();
      if (docs) {
        callback(err, docs.name);
      } else {
        callback(err, null);
      }
    });
  }); 
};

exports.getSortedMembers = function (callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(member_collection);
    collection.find().toArray(function(err, docs) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        docs.sort(function (a, b) {
          return a.balance<b.balance;
        });
        var ret = [];
        for (var i = docs.length - 1; i >= 0; i--) {
          ret.push(docs[i]);
        };
        callback(err, ret);
      }
    });
  }); 
}