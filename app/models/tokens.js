#!/usr/bin/env node
/*
channel+ © 2015
*/

var mongoose = require('../lib/mongoose');

var schema = new mongoose.Schema({
  token : {
    type : String,
    unique : true
  },
  userId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  expirationTime : {
    type : Date
  },
  created : {
    type : Date,
    'default' : Date.now()
  }
}, {
  versionKey : false
});

schema.set('toObject', {
  // virtuals : true,
  transform : function(doc, ret, options) {
    delete ret.userId;
    delete ret.created;
  }
});

exports.Tokens = mongoose.model('Tokens', schema);
