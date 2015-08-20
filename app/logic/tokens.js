#!/usr/bin/env node
/*
channel+ © 2015
*/

var crypto = require('crypto');
var Tokens = require('../models/tokens').Tokens;
var UserLogic = require('./user');
var Utils = require('../lib/utils');

exports.findByValue = function(tokenValue, callback) {
  Tokens.findOne({
    token : tokenValue
  }, callback);
};

exports.createToken = function(userId, callback) {
  var token = new Tokens({
    userId : userId,
    expirationTime : new Date().setDate(new Date().getDate() + 3)
  });
  UserLogic.getUserById(userId, function(err, user) {
    if (err) {
      return callback(err);
    }
    crypto.randomBytes(128, function(err, buf) {
      if (err) {
        return callback(err);
      }
      token.token = crypto.createHmac('sha384', buf.toString('base64')).update(Date.now().toString(16)).digest('hex');
      token.save(function(err, token) {
        if (err) {
          return callback(err);
        }
        callback(null, token);
      });
    });
  });
};

exports.passwordResetToken = function(userId) {
  var now = new Date;
  now.setDate(now.getDate() + 1);
  var token = new Tokens({
    userId : userId,
    expirationTime : now,
    token: Utils.createUUID()
  });
  token.save();
  return token;
};

exports.expireToken = function(tokenValue, callback) {
  Tokens.findOne({
    token : tokenValue
  }, function(err, token) {
    if (err) {
      return callback(err);
    }
    if (!token) {
      return callback(null);
    }

    token.expirationTime = Date.now();
    token.save(function(err, token) {
      if (err) {
        return callback(err);
      }
      callback(null, token);
    });
  });
};

exports.deleteTokenById = function(tokenId, callback) {
  var convertedId = Utils.toObjectId(tokenId);
  if (convertedId instanceof AppError) {
    return callback(convertedId);
  }
  Tokens.findByIdAndRemove(convertedId, callback);
};

exports.deleteTokens = function(tokenValue, callback) {
  Tokens.remove(tokenValue, callback);
};

splitByBearer = function(rawToken) {
  if (rawToken.indexOf('Bearer') > -1) {
    return rawToken.split('Bearer ')[1];
  };
  return rawToken;
};

exports.getUserByToken = function(token, cb) {
  var was = this;
  token = splitByBearer(token)
  console.log('getUserByToken')
  was.findByValue(token, function(err, _token) {
    if (err) {
      console.log('err no token found in db')
      return cb(err);
    }
    console.log(_token)
    if (!_token || _token.expirationTime < Date.now()) {
      console.log('err _token')
      return cb(err);
    }

    // console.log('get user id by token')
    // console.log(token)
    
    UserLogic.getUserById(_token.userId, function(err, user) {
      if (err) {
        return cb(err);
      }
      cb(null, user)
    })
  })
}

exports.validateUserWithToken = function(token, userId, cb) {
  var was = this
  this.getUserByToken(token, function(err, user) {
    if (err) return cb(err);
    return cb(null, (userId.toString() === user._id.toString()))
  })
}