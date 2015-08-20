#!/usr/bin/env node
/*
channel+ © 2015
*/

var mongoose = require('mongoose');
var Social = require('../services/social');
var Textual = require('../services/twText');
var was = this;

exports.toObjectId = function(id) {
  var _id;
  if ( id instanceof mongoose.Types.ObjectId) {
    return id;
  }
  try {
    _id = mongoose.Types.ObjectId(id);
  } catch(err) {
    return id;
  }
  return _id;
};

exports.daysSinceSubscription = function(date) {
    if (!date) return 999;
    var today = new Date();
    var one_day = 1000*60*60*24;
    return Math.ceil((date.getTime() - today.getTime())/(one_day));
}

function updateUserFb(user, res) {
    user.numberPosts += 1;
    user.fbPostsToday += 1;
    user.numberPosts += 1;
    user.fbError = false;
    user.weeklyPostSummary = user.weeklyPostSummary || [];
    user.weeklyPostSummary[0] = user.weeklyPostSummary[0] || 0;
    user.weeklyPostSummary[0] = user.weeklyPostSummary[0] + 1;
    user.markModified('weeklyPostSummary');
    user.save();
    if (res) res.send(200);
}

function updateUserTw(user, res) {
    user.numberPosts += 1;
    user.twPostsToday += 1;
    user.numberPosts += 1;
    user.twError = false;
    user.lastTwitterError = [];
    user.weeklyPostSummary = user.weeklyPostSummary || [];
    user.weeklyPostSummary[0] = user.weeklyPostSummary[0] || 0;
    user.weeklyPostSummary[0] = user.weeklyPostSummary[0] + 1;
    user.markModified('weeklyPostSummary');
    user.save();
    if (res) res.send(200);
}

function userFbErr(user, err, res) {
    user.fbError = true;
    user.save();
    //console.log('userFbErr', err)
    if (res) res.send(400, err);
}

function userTwErr(user, err, res) {
    user.twError = true;
    user.lastTwitterError = user.lastTwitterError || [];
    if (user.lastTwitterError.length > 10) user.lastTwitterError = [];
    user.lastTwitterError.unshift(err);
    user.save();
    //console.log('userTwErr', err)
    if (res) res.send(400, err);
}

exports.newsfeedPostFromCron = function(user, options) {
    // send to Fb with title and link
    //console.log(options)
    var body = options.text;
    var link = options.url;
    var postUrl = '/v2.3/' + user.fbID + '/feed';
    var postObj = {access_token: user['fbKey'], message: body, link: link};
    if (options.fbOK) {
        Social.sendFb(postUrl, postObj, function(err) {
            if (err) return userFbErr(user, err);
            updateUserFb(user);
        });
    };

    // format body and link for Twitter
    var charCount = 0;
    if (link) charCount += 30;
    charCount += body.length;
    if (charCount > 140) {
        body = Textual.processText(body);
    }
    body = body + ' ' + link;
    if (options.twOK) {
        Social.sendTwitter({
            consumer_key: user.twKey,
            consumer_secret: user.twSec,
            access_token_key: user.twToK,
            access_token_secret: user.twToS
        }, body, function(err) {
            if (err) return;
            updateUserTw(user);
        });
    };
};

exports.marketingPostFromCron = function(user, options) {
    // send to Fb with title and link
    var body = options.body;
    var link = options.title || '';

    var toFacebook = (options.destination === 0 || options.destination === 1) ? true : false;
    var toTwitter = (options.destination === 0 || options.destination === 2) ? true : false;

    if (toFacebook && options.fbOK) {
        var postUrl = '/v2.3/' + user.fbID + '/feed';
        var postObj = {access_token: user['fbKey'], message: body, link: link};
        Social.sendFb(postUrl, postObj, function(err) {
            if (err) return userFbErr(user, err);
            updateUserFb(user);
        });
    };

    // // format body and link for Twitter
    if (toTwitter && options.twOK) {
        var charCount = 0;
        if (link) charCount += 30;
        charCount += body.length;
        if (charCount > 140) {
            body = Textual.processText(body);
        }
        body = body + ' ' + link;
        Social.sendTwitter({
            consumer_key: user.twKey,
            consumer_secret: user.twSec,
            access_token_key: user.twToK,
            access_token_secret: user.twToS
        }, body, function(err) {
            if (err) return userTwErr(user, err);
            updateUserTw(user);
        });
    };
};

exports.linkMediaFormatPostNow = function(user, options, dir, res) {
    var link = options.inputField1 || '';
    var body = options.inputField2 || '';
    if (body.length + link.length === 0) return res.send(200);

    if (dir === 'fb') {
        if (user.fbError === true) return res.send(200);
        var postUrl = '/v2.3/' + user.fbID + '/feed';
        var postObj = {access_token: user['fbKey'], message: body, link: link};
        Social.sendFb(postUrl, postObj, function(err) {
            if (err) return userFbErr(user, err, res);
            updateUserFb(user, res);
        });
    };

    if (dir === 'tw') {
        var charCount = 0;
        if (link) charCount += 30;
        charCount += body.length;
        if (charCount > 140) {
            body = Textual.processText(body);
        }
        body = body + ' ' + link;
        Social.sendTwitter({
            consumer_key: user.twKey, 
            consumer_secret: user.twSec,
            access_token_key: user.twToK,
            access_token_secret: user.twToS
        }, body, function(err) {
            if (err) return userTwErr(user, err, res);
            updateUserTw(user, res);
        });
    };
};

exports.createUUID = function() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}