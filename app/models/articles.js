#!/usr/bin/env node
/*
channel+ © 2015
*/

var mongoose = require('../lib/mongoose');

var schema = new mongoose.Schema({
  topic : {
    type : String,
    unique : true
  },
  url: String,
  users: {
    type: mongoose.Schema.Types.Mixed,
    'default': []
  },
  createdAt: {
    type: Date,
    'default': new Date()
  },
  createdBy: mongoose.Schema.Types.ObjectId
}, {
  versionKey : false
});

exports.Articles = mongoose.model('Articles', schema);
