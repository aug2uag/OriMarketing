#!/usr/bin/env node
/*
channel+ © 2015
*/

var Articles = require('../models/articles').Articles;

exports.addArticles = function(topic, prevTopic, userId, callback) {
  
  function createArticle(topic, userId, next) {
    var article = new Articles({topic: topic, createdBy: userId});
    article.save(function(err) {
      if (err) return next(true);
      next(null, article);
    });
  }

  function performAdd(article, userId, next) {
    article.users = article.users || [];
    for (var i = 0; i < article.users.length; i++) {
      if (article.users[i].toString() === userId.toString()) {
        return next();
      };
    };
    article.users.push(userId);
    article.markModified('users');
    article.save();
    next();
  };

  function removeUser(topic, userId, next) {
    Articles.findOne({topic: topic}, function(err, article) {
      if (article) {
        var users = article.users || [];
        var arr = [];
        for (var i = 0; i < users.length; i++) {
          if (users[i].toString() === userId.toString()) {
            users.splice(i, 1);
            article.markModified('users');
            article.save(function() {
              next();
            });
          } else {
            if (arr.length === users.length) {
              next();
            };
            arr.push(true);
          };
        };
      } else {
        next();
      };
    });
  }

  removeUser(prevTopic, userId, function() {
    Articles.findOne({topic: topic}, function(err, article) {
      if (err) return callback(true);
      if (!article) {
        createArticle(topic, userId, function(err, article) {
          if (err) return callback(true);
          performAdd(article, userId, function() {
            return callback(null);
          });
        });
      } else {
        performAdd(article, userId, function() {
          return callback(null);
        });
      };
    });
  });
};
