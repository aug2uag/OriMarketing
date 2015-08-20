#!/usr/bin/env node
/*
channel+ © 2015
*/

var config = require('../../config');
var mongoose = require('mongoose');

module.exports = mongoose.createConnection(config.get('mongoose:uri'), config.get('mongoose:options'));
module.exports.Schema = mongoose.Schema;
