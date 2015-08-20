#!/usr/bin/env node
/*
channel+ © 2015
*/

var crypto = require('crypto');
var AppError = require('../error').AppError;
var AuthError = require('../error').AuthError;
var Utils = require('../lib/utils');
var User = require('../models/user').User;
var TokensLogic = require('../logic/tokens');
var ViewController = require('../controllers/view');

exports.changePassword = function(password, user, callback) {
  user.resetToken = undefined;
  user.resetExpirationDate = undefined;
  user.hashPassword(password, function(err, dk) {
    if (err) {
      return callback(err);
    }
    user.password = dk;
    user.save(function(err, user) {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  });
};

exports.getUserById = function(userId, callback) {
  var convertedId = Utils.toObjectId(userId);
  if ( convertedId instanceof AppError) {
    return callback(convertedId);
  }
  User.findById(convertedId, function(err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback(new AppError(404, 'Sorry, but user does not exist.'));
    }
    callback(null, user);
  });
};

exports.getUserByEmail = function(userEmail, callback) {
  User.findOne({
    email : userEmail
  }, callback);
};

exports.createUser = function(options, callback) {
  var user = new User({
    email : options.email
  });
  user.hashPassword(options.password, function(err, dk) {
    if (err) {
      return callback(err);
    }
    user.password = dk;
    user.developerType = options.developerType;
    
    user.save(function(err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, user);
    });
  });
};
