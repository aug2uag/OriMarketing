#!/usr/bin/env node
/*
channel+ © 2015
*/

var BearerStrategy = require('passport-http-bearer').Strategy;
var TokensLogic = require('../logic/tokens');
var UsersLogic = require('../logic/user');
var AppError = require('../error').AppError;

module.exports = function(passport) {
  passport.use('bearer', new BearerStrategy(function(accessToken, callback) {
    if (accessToken) {
      TokensLogic.findByValue(accessToken, function(err, token) {
      if (err) {
        return callback(err);
      }
      if (!token || token.expirationTime < new Date) {
        return callback('Session expired. Please sign in.');
      }
      UsersLogic.getUserById(token.userId, function(err, user) {
        if (err) {
          return callback(err);
        }
        if (!user) {
          return callback('Account does not exist.');
        }
        user.lastVisit = new Date();
        user.save();
        callback(null, user, {
          scope : '*',
          accessToken : accessToken
        });
      });
    });};
  }));
};
