#!/usr/bin/env node
/*
channel+ © 2015
*/

var TokensLogic = require('../logic/tokens');
var UserLogic = require('../logic/user');
var AppError = require('../error').AppError;
var AuthError = require('../error').AuthError;
var User = require('../models/user').User;
var Mailer = require('../services/mailer');
var async = require('async');
var Utils = require('../lib/utils');

var authorize = function(email, password, callback) {
  User.findOne({
    email : email
  }, function(err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback('Sorry, the email did not match our records.');
    }
    if (!user.activationTime) {
      return callback('Sorry, email is not verified.');
    }
    user.checkPassword(password, function(err, dk) {
      if (err) {
        return callback(err);
      }
      if (user.password !== dk) {
        return callback('Sorry, but the password is invalid.');
      }
      user.lastVisit = Date.now();
      user.save(function(err, user) {
        if (err) {
          return callback(err);
        }
        callback(null, user);
      });
    });
  });
};

var signinUser = function(userId, callback) {
  var convertedId = Utils.toObjectId(userId);
  if ( convertedId instanceof AppError) {
    return callback(convertedId);
  }
  User.findById(convertedId, function(err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback('User not found.');
    }
    if (!user.activationTime) {
          Mailer.sendActivationEmail(user);
          return callback('Account is not activated.\n\nConfirmation email sent now. Please confirm email to continue.');
        };
    user.activationTime = Date.now();
    user.save(function(err, user) {
      if (err) {
        return callback(err);
      }
      callback(null, user);
    });
  });
};

exports.verifyUserEmail = function(req, res) {
  var userId = req.params.id;
  var convertedId = Utils.toObjectId(userId);
  if ( convertedId instanceof AppError) {
    return res.send(400);
  }
  User.findById(convertedId, function(err, user) {
    if (err || !user) {
      return res.send(400);
    }
    user.activationTime = Date.now();
    user.save(function(err, user) {
      if (err) {
        return res.redirect(400);
      }
      res.redirect('/signin');
    });
  });
};

exports.signin = function(req, res, next) {
  async.waterfall([
  function(callback) {
    var tokenValue = (req.headers.authorization || '').replace(/^(bearer)\s|(undefined)|(null)/gi, '');
    // if they have a token then they may be signing in for the first time, so we should ativate them
    if (tokenValue) {
      TokensLogic.findByValue(tokenValue, function(err, token) {
        if (err) return callback(err);
        //if (!token || token.expirationTime < Date.now()) return callback(new AppError(400, 'Invalid token! 1'));
        signinUser(token.userId, function(err, user) {
          if (err) return callback(err);
          user.save(function(err, newUser){
            //we expire this token to prep for token creation down below
            TokensLogic.expireToken(token.token, function(err) {
              if (err) return callback(err);
              callback(null);
            });
          }); 
        });
      });
    }
    //if they don't have a token proceed signing in as normal, it will error later if they are not activated 
    else{
      callback(null);
    }
  },
  function(callback) {
    var document = req.body;
    //attempt to auth the user
    authorize(document.email, document.password, function(err, user) {
      if (err) return callback(err);
      //we create a new token everytime the user logs in to prevent sessions on different computer remaining active
      TokensLogic.createToken(user._id, function(err, token) {
        if (err) return callback(err);
        callback(null, user, token);
      });
    });
  }], function(err, user, token) {
    if (err) return res.send(400, err);
    var _data = token.toObject();
    res.send(200, _data);
  });
};

exports.signout = function(req, res) {
  TokensLogic.expireToken(req.authInfo.accessToken, function(err) {
    if (err) {
      return next(err);
    }
    res.send(200);
  });
};

exports.createUser = function(req, res) {
  var document = req.body;
  async.waterfall([
  function(callback) {
    UserLogic.getUserByEmail(document.email, function(err, user) {
      if (err) {
        return callback(err);
      };
      if (user) {
        return res.send(400, 'User already exists!');
      }
      callback(null);
    });
  },
  function(callback) {
    UserLogic.createUser({
      email : document.email,
      password : document.password
    }, function(err, user) {
      if (err) return callback(err);
      TokensLogic.createToken(user._id, function(err, token) {
        if (err) {
          return callback(err);
        }
        Mailer.sendActivationEmail(user);
        callback(null, user, token);
      });
    });
  }

  ], function(err, user, token) {
    if (err || !user || !token) {
      return res.send(400, 'Not successful to create user, please contact us or try again later.');
    }
    res.send(200);
  });
};

exports.resetPassword = function(req, res) {
  var email = req.body.email;
  var token = TokensLogic.passwordResetToken();
  UserLogic.getUserByEmail(email, function(err, user) {
    if (user) Mailer.resetPasswordEmail(user, token.token);
  });
  res.send(200);
};

exports.makeNewPassword = function(req, res) {
  var uid = req.params.uid;
  var password = req.body.password;
  UserLogic.getUserById(uid, function(err, user) {
    if (err || !user) return res.send(400);
    UserLogic.changePassword(password, user, function(err) {
      if (err) return res.send(400);
      res.send(200);
    });
  });
};