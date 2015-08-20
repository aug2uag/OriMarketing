#!/usr/bin/env node
/*
channel+ © 2015
*/

var nconf = require('nconf');

nconf.argv().env().file({
  file : __dirname + '/config.json'
});

module.exports = nconf;
