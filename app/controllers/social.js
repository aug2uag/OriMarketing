#!/usr/bin/env node
/*
channel+ © 2015
*/

exports.updateFbTok = function(req, res) {
  var document = req.body;
  var user = req.user;
  var FB = require('fb');
 
  FB.api('oauth/access_token', {
      client_id: user.fbAID,
      client_secret: user.fbSec,
      grant_type: 'fb_exchange_token',
      fb_exchange_token: document.tok
  }, function (feedback) {
      if(!feedback || feedback.error) {
          // console.log(!feedback ? 'error occurred' : feedback.error);
          var err = feedback && feedback.error || 'unable to retrieve Facebook Token';
          user.fbError = true;
          user.save();
          return res.send(400, err);
      }
      user['fbID'] = document.id;
      user['fbKey'] =  feedback.access_token || req.body.fbTok || user['fbKey'] || '';
      user.fbError = false;
      user.systemStatus = true;
      user.save();
      res.send(200);
  });
};

exports.sendSocialMediaBlast = function(req, res) {
  var document = req.body;
  var direction = req.params.direction;
  var user = req.user;

  switch (document.mediaType) {
    case 'auto-media':
      // send to Util function for image generate and post

      break;

    case 'link-media':
      //  format in Util func
      Utils.linkMediaFormatPostNow(user, document, direction, res);
      break;

    case 'no-media':
      // format in Util func
      Utils.linkMediaFormatPostNow(user, document, direction, res);
      break;

    default:
      break;
  }
};

exports.updateSocialConfigs = function(req, res) {
  var document = req.body;
  var user = req.user;
  for (var k in document) {
    user[k] = document[k] || user[k];
  }
  user.save();
  res.send(200);
}