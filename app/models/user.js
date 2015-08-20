#!/usr/bin/env node
/*
channel+ © 2015
*/

var crypto = require('crypto');
var mongoose = require('../lib/mongoose');
var rbac = require('mongoose-rbac');

var schema = new mongoose.Schema({

  email : {
    required : true,
    type : String,
    trim : true,
    unique : true
  },

  password : {
    required : true,
    type : String
  },

  salt : {
    //required : true,
    type: String
  },

  lastTwitterError: Array,

  name : String,

  fbAID: String,

  fbKey: String,

  fbID: String,

  fbSec: String,

  fbNom: String,

  twKey: String,

  twSec: String,

  twToK: String,

  twToS: String,

  numberPosts: {
    type: Number,
    'default': 0
  },

  twPostsToday: {
    type: Number,
    'default': 0
  },

  fbPostsToday: {
    type: Number,
    'default': 0
  },

  totalOutreach: {
    type: Number,
    'default': 0
  },

  systemStatus: {
    type: Boolean,
    'default': false
  },

  setAutoBot: {
    type: Boolean,
    'default': false
  },

  resetPasswordUUID: String,

  newsfeedKeyword: String,

  weeklyPostSummary: {
    type: mongoose.Schema.Types.Mixed,
    'default': []
  },

  newsfeedPending: {
    type: mongoose.Schema.Types.Mixed,
    'default': []
  },

  newsfeedApproved: {
    type: mongoose.Schema.Types.Mixed,
    'default': []
  },

  marketingCampaigns: {
    type: mongoose.Schema.Types.Mixed,
    'default': []
  },

  pastThreeDays: {
    type: mongoose.Schema.Types.Mixed,
    'default': []
  },

  customerOutreach: {
    type: mongoose.Schema.Types.Mixed,
    'default': []
  },

  dateLastCampaignPost: Date,

  dateLastNewsfeedPost: Date,

  timeLastPost: Date,

  keywordResultWasEmpty: {
    type: Boolean,
    'default': false
  },

  fbError: {
    type: Boolean,
    'default': false
  },

  twError: {
    type: Boolean,
    'default': false
  },

  created : {
    type : Date,
    'default' : Date.now()
  },

  activationTime : {
    type : Date
  },

  lastVisit : {
    type : Date
  },

  resetToken : String,

  resetExpirationDate : Date
},

  {
    versionKey : false
  });

schema.methods.hashPassword = function (password, callback) {
  crypto.randomBytes(32, function (err, buf) {
    if (err) {
      console.error(err.stack || err);
    }
    this.salt = buf.toString('base64');
    console.log(this)
    console.log(password)
    crypto.pbkdf2(password, this.salt, 10000, 512, function(err, buf) {
      callback(err, crypto.createHmac('sha384', this.salt).update(buf.toString('base64')).digest('base64'));
    }.bind(this));
  }.bind(this));
};

schema.methods.checkPassword = function(password, callback) {
  crypto.pbkdf2(password, this.salt, 10000, 512, function(err, buf) {
    callback(err, crypto.createHmac('sha384', this.salt).update(buf.toString('base64')).digest('base64'));
  }.bind(this));
};

schema.plugin(rbac.plugin);

schema.set('toObject', {
  // virtuals : true,
  transform : function(doc, ret, options) {
    delete ret.password;
    delete ret.salt;
  }
});

exports.User = mongoose.model('User', schema);