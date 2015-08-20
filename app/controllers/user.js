#!/usr/bin/env node
/*
channel+ © 2015
*/

var UserLogic = require('../logic/user');
var ArticleLogic = require('../logic/articles');
var Utils = require('../lib/utils');
var mongoose = require('mongoose');

exports.updateUser = function(req, res) {
  var userUpdates = req.body
  UserLogic.updateUserProfile({user: req.user, updates: userUpdates}, function(err, result) {
    if (err) {return res.send(400);}
    res.send(200);
  });
};

exports.checkResetToken = function(req, res) {
  UserLogic.checkResetToken(req.body.token, function(err, user) {
    if (err) return res.send(400);
    res.send(200);
  });
};

exports.getAuthenticated = function(req, res) {
  var user = req.user;
  var obj = {};
  obj.numberPosts = user.numberPosts/2;
  obj.twitterToday = user.twPostsToday;
  obj.facebookToday = user.fbPostsToday;
  obj.numberImpressions = user.totalOutreach;
  obj.systemStatus = user.systemStatus;
  obj.newsItemsPending = user.newsfeedPending && user.newsfeedPending.length || 0;
  obj.newsItemsApproved = user.newsfeedApproved && user.newsfeedApproved.length || 0;
  obj.greetings = user.marketingCampaigns && user.marketingCampaigns.length || 0;
  obj.weeklySummary = user.weeklyPostSummary || [];
  obj.fbError = user.fbError;
  obj.twError = user.twError;
  obj.lastTwitterError = user.lastTwitterError || [];
  obj.autobot = user.setAutoBot || false;
  for (var key in obj) {
    if (typeof obj[key] === 'number') obj[key] = Math.floor(obj[key]);
  }
  res.json(obj);
};

exports.getUserConfigs = function(req, res) {
  var user = req.user;
  var obj = {};
  obj.fbAID = user.fbAID;
  obj.fbNom = user.fbNom;
  obj.fbError = user.fbError;
  obj.twError = user.twError;
  obj.fbHasToken = user.systemStatus;
  res.json(obj);
}

exports.appendMarketingCampaign = function(req, res) {
  var document = req.body;
  var user = req.user;
  var campaignObject = {};
  campaignObject.autoMedia = document.mediaType === 'auto-media' ? true : false;
  campaignObject.title = document.inputField1 || '';
  campaignObject.destination = document.destination;
  campaignObject.body = document.inputField2;
  campaignObject._id = mongoose.Types.ObjectId();
  user.marketingCampaigns = user.marketingCampaigns || [];
  user.marketingCampaigns.push(campaignObject);
  user.markModified('marketingCampaigns');
  user.save();
  res.json(campaignObject);
}

exports.getMarketingCampaigns = function(req, res) {
  var campaigns = req.user.marketingCampaigns || [];
  res.json(campaigns);
}

exports.getDomainExpertise = function(req, res) {
  var obj = {};
  var user = req.user;
  obj.keyword = user.newsfeedKeyword || '';
  obj.approved = user.newsfeedApproved || [];
  obj.pending = user.newsfeedPending || [];
  obj.autobot = user.setAutoBot || false;
  obj.kwEmpty = user.keywordResultWasEmpty || false;
  res.json(obj);
}

exports.updateExpertiseSubject = function(req, res) {
  var kw = req.body.kw;
  var user = req.user;
  ArticleLogic.addArticles(kw, user.newsfeedKeyword, user._id, function(err) {
    if (err) return res.send(400);
    user.newsfeedKeyword = kw;
    user.save();
    res.send(200);
  });
}

exports.deleteItem = function(req, res) {
  var arr, name;
  var _id = req.body.id;
  switch(req.params.direction) {
    case 'marketing':
      arr = req.user.marketingCampaigns;
      name = 'marketingCampaigns';
      break;

    case 'approval':
      arr = req.user.newsfeedApproved;
      name = 'newsfeedApproved';
      break;

    case 'pending':
      arr = req.user.newsfeedPending
      name = 'newsfeedPending';
      break;

    default:
      break;
  }

  for (var i = 0; i < arr.length; i++) {
    if (arr[i]._id.toString() === _id) {
      arr.splice(i, 1);
      req.user.markModified(name);
      req.user.save();
      break;
    };
  };
  res.send(200);
}

exports.migrateApprovedItem = function(req, res) {
  var user = req.user;
  var newsfeedApproved = user.newsfeedApproved || [];
  var newsfeedPending = user.newsfeedPending || [];
  var _id = Utils.toObjectId(req.body.id);
  var item;
  for (var i = 0; i < newsfeedPending.length; i++) {
    if (newsfeedPending[i]._id === _id) {
      item = newsfeedPending.splice(i, 1)[0];
      newsfeedApproved.push(item);
      user.markModified('newsfeedApproved');
      user.markModified('newsfeedPending');
      user.save();
      break;
    };
  };
  if (item) return res.json(item);
  res.send(400)
}

exports.ignoreKwEmails = function(req, res) {
  UserLogic.getUserById(req.params.id, function(err, user) {
    if (err) return res.send(400);
    user.customerOutreach = user.customerOutreach || {};
    user.customerOutreach.keywordHelp = user.customerOutreach.keywordHelp || {};
    user.customerOutreach.keywordHelp.ignore = true;
    user.markModified('customerOutreach');
    user.save();
    res.redirect('/unsubscribe');
  });
}

exports.editPostItemBody = function(req, res) {
  var user = req.user;
  var newTxt = req.body.edit;
  var arr, arrName, moveToApproved = false;
  switch(req.params.type) {
    case 'pending':
      moveToApproved = true;
      arr = user.newsfeedPending;
      arrName = 'newsfeedPending';
      break;

    case 'approval':
      arr = user.newsfeedApproved;
      arrName = 'newsfeedApproved';
      break;

    case 'marketing':
      arr = user.marketingCampaigns;
      arrName = 'marketingCampaigns';
      break;

    default:
      arr = [];
      arrName = null;
  }

  var returnObj = {'empty': null};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]._id.toString() === req.params.id) {
      // match
      var item = arr.splice(i, 1);
      if (item instanceof Array) item = item[0];
      if (newTxt && newTxt.length > 0) {
        if ('text' in item) item.text = newTxt;
        else if ('body' in item) item.body = newTxt;
      };
      returnObj = item;
      if (item && moveToApproved) {
        // pending only
        user.newsfeedApproved = user.newsfeedApproved || [];
        user.newsfeedApproved.unshift(item);
        user.markModified('newsfeedPending');
        user.markModified('newsfeedApproved');
      } else {
        arr.splice(i, 0, item);
        user.markModified(arrName);
      };

      if (req.body.approve) {
        user.marketingCampaigns = user.marketingCampaigns || [];
        user.marketingCampaigns.unshift({
          _id: item._id,
          body: item.text,
          destination: 0,
          title: item.url,
          autoMedia: false
        });
        user.markModified('marketingCampaigns');
      };

      user.save();
      return res.json(returnObj);
    };
  };
  res.send(200);
}

exports.setAutoBot = function(req, res) {
  var user = req.user;
  if (user) {
    user.setAutoBot = !user.setAutoBot;
    user.save();
  };
  res.send(200);
}