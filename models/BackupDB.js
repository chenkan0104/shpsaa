var settings = require('../settings.js');
var mongod_path = 'mongodb://'+settings.host+':'+settings.port+'/'+settings.db;
var backup_collection = settings.backup_collection;
var member_collection = settings.member_collection;

exports.insertBackup = function(backup, callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(backup_collection);
    collection.insert(backup, {w:1}, function(err, docs) {
      db.close();
      if (docs) {
        callback(err, docs);
      } else {
        callback(err, null);
      }
    });
  });
};

exports.findAllBackup = function(callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(backup_collection);
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

exports.findBackupByTime = function (time, callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(backup_collection);
    collection.findOne({"time": parseInt(time)}, function(err, docs) {
      db.close();
      if (docs) {
        callback(err, docs);
      } else {
        callback(err, null);
      }
    });
  }); 
};

exports.saveMembers = function (members, callback) {
  var MongoClient = require('mongodb').MongoClient;
  var format = require('util').format;

  MongoClient.connect(mongod_path, function(err, db) {
    if(err) throw err;

    var collection = db.collection(member_collection);
    var i = 0;
    saveMember(members[i]);
    function saveMember (member) {
      collection.save(member, function (err, docs) {
        if (err) {
          callback(err, null);
        } else {
          i++;
          if (i == members.length) {
            callback(err, docs);
          } else {
            saveMember(members[i]);
          }
        }
      });
    }
  }); 
};
