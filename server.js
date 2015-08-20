#!/usr/bin/env node
/*
channel+ 2015
*/


var config = require('./config');
var express = require('express');
var app = module.exports = express(), errorHandler;
var fs = require('fs');
var server = require('http').createServer(app);
var mongoose = require('./app/lib/mongoose');
var rbac = require('mongoose-rbac');
var passport = require('passport'), auth = require('./app/auth/strategy')(passport);
var AppError = require('./app/error').AppError;
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var path = require('path');
app.set('trust proxy', true);
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(require('cookie-parser')());
app.use(require('morgan')('dev'));
app.use((errorHandler = require('errorhandler')(), errorHandler));
app.use(require('./app/middleware/sendHttpError'));
app.use('/', require('./routes')(express, passport));
app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname,'public','img','favicon.ico')));

app.use(function(err, req, res, next) {
  console.error(err);
  if (typeof err === 'number') {
    err = new AppError(err);
  }
  if (err instanceof AppError) {
    res.sendHttpError(err);
  } else {
    if (app.get('env') === 'development') {
      errorHandler(err, req, res, next);
    } else {
      res.sendHttpError(new AppError(500));
    }
  }
});

/*
  CATCH ALL ERROR ROUTES
*/
app.use(function(req, res){
  return res.sendfile(__dirname + '/public/404.html');
});

var port = process.env.OPENSHIFT_NODEJS_PORT || 4112;
var ipaddr = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
server.listen(port, ipaddr, function() {
  console.log('Express server listening on port ' + server.address().port + ' at ' + server.address().address);
});
