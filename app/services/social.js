#!/usr/bin/env node
/*
channel+ © 2015
*/

exports.sendFb = function(postUrl, postObj, cb) {
	var FB = require('fb');
	FB.api(postUrl, 'post', postObj, function (feedback) {
		if (feedback.error) { 
			var errObject = {
				'errMessage': feedback.error.message,
				'errNum': feedback.error.code
			}
			return cb(errObject); 
		};
	  	cb(null);
	});
};

exports.sendTwitter = function(options, body, cb) {
	var twitter = require('ntwitter');
	var twit = new twitter(options);
	twit.verifyCredentials(function (err, data) {
		if (err) return cb(err);
	}).updateStatus(body, function (err, data) {
		if (err) return cb(err);
		return cb(null);
	});
}
