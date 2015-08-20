#!/usr/bin/env node
/*
channel+ © 2015
*/

var TokensLogic = require('../logic/tokens');
var path = require('path');
var fs = require('fs');
var doT = require('dot');
var request = require('request');

exports.robotsText = function(req, res) {
	return res.sendfile('robots.txt');
};

exports.sitemap = function(req, res) {
	return res.sendfile('sitemap.xml');
}

exports.getGoogleWebMaster = function(req, res) {
	return res.sendfile('googlef801d49e70679353.html');
}

exports.getSplashPage = function(req, res) {
	var _path = path.resolve(path.join('public', 'index.html'));
	return res.sendfile(_path);
}

exports.getSigninView = function(req, res) {
	var _path = path.resolve(path.join('public', 'signin.html'));
	return res.sendfile(_path);
}

exports.resetPasswordView = function(req, res) {
	// check token
	var document = req.params;
	TokensLogic.findByValue(document.token, function(err, token) {
		if (err) return res.send(400);
		console.log(new Array(100).join('!'));
		console.log(token);
		if (!token || token.expirationTime < new Date) {
			var _path = path.resolve(path.join('public', 'reset.expired.html'));
			return res.sendfile(_path);
		}
		TokensLogic.expireToken(token.token);
		var _path = path.resolve(path.join('public', 'password.reset.html'));
		fs.readFile(_path, 'utf-8', function(err, data) {
			if (err || !data) { return res.send(400); };
			var template = doT.template(data);
			var result = template({uid: document.uid});
			res.writeHead(200, { 'content-type': 'text/html' });
			return res.write(result);
		});
	});
}

exports.getRegistrationView = function(req, res) {
	var _path = path.resolve(path.join('public', 'register.html'));
	return res.sendfile(_path);
}

exports.getHomeView = function(req, res) {
	var _path = path.resolve(path.join('public', 'home.html'));
	return res.sendfile(_path);
}

exports.getMarketingView = function(req, res) {
	var _path = path.resolve(path.join('public', 'marketing.html'));
	return res.sendfile(_path);
}

exports.getNewsfeedView = function(req, res) {
	var _path = path.resolve(path.join('public', 'news.html'));
	return res.sendfile(_path);
}

exports.getConfig = function(req, res) {
	var _path = path.resolve(path.join('public', 'config.html'));
	return res.sendfile(_path);
}

exports.getHelpSection = function(req, res) {
	var _path = path.resolve(path.join('public', 'help.section.html'));
	return res.sendfile(_path);
}

exports.getContactUs = function(req, res) {
	var _path = path.resolve(path.join('public', 'contact.us.html'));
	return res.sendfile(_path);
}

exports.getUnsubscribedView = function(req, res) {
	var _path = path.resolve(path.join('public', 'unsubscribe.html'));
	return res.sendfile(_path);
}

exports.sendArticlesPreview = function(req, res) {
	var topic = req.body.topic;
	topic = topic.replace(' ', '+');
	var returnObj = [];
	var url = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + topic + '&api-key=96299469529754e0f1feff73c774df0d%3A6%3A72523825';
	request(url, function(err, body, result) {
		if (err) return res.send(400);
		try {
			var rslt = JSON.parse(result);
			var docs = rslt['response']['docs'];
			docs.forEach(function(r) {
				returnObj.push(r.snippet);
			});
		}

		catch(e) {
			console.log(e)
		}

		finally {
			res.json(returnObj);
		}
	});
};