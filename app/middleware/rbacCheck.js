#!/usr/bin/env node
/*
channel+ © 2015
*/

var AppError = require('../error').AppError;

module.exports = function(action, object) {
  return function(req, res, next) {
    if (!req.user) {
      return next(new AppError(403, 'Insufficient privileges!'));
    }
    req.user.can(action, object, function(err, isGranted) {
      if (!isGranted) {
        return next(new AppError(403, 'Insufficient privileges!'));
      }
      next();
    });
  };
};
