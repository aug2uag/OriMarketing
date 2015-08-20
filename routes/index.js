#!/usr/bin/env node
/*
channel+ © 2015
*/

var Login = require('../app/controllers/signin');
var User = require('../app/controllers/user');
var Social = require('../app/controllers/social');
var Views = require('../app/controllers/view');

module.exports = function(express, passport) {
  var router = express.Router();

  router.all('/api/*',function(req, res, next) {
    next();
  }, passport.authenticate('bearer', {
    session : false
  }), function(req, res, next) {
    next();
  });

  /* GET */
  router.get('/verify/:id', Login.verifyUserEmail);
  router.get('/api/users/signout', Login.signout);
  router.get('/', Views.getSplashPage);
  router.get('/mobile', Views.getSplashPage);
  router.get('/signin', Views.getSigninView);
  router.get('/register', Views.getRegistrationView);
  router.get('/unsubscribe', Views.getUnsubscribedView);
  router.get('/reset/:uid/:token', Views.resetPasswordView);
  router.get('/home', Views.getHomeView);
  router.get('/marketing', Views.getMarketingView);
  router.get('/newsfeed', Views.getNewsfeedView);
  router.get('/config', Views.getConfig);
  router.get('/help', Views.getHelpSection);
  router.get('/contactus', Views.getContactUs);
  router.get('/api/user', User.getAuthenticated);
  router.get('/api/marketing', User.getMarketingCampaigns);
  router.get('/api/expertise', User.getDomainExpertise);
  router.get('/api/user/configs', User.getUserConfigs);
  router.get('/ignore/kw/:id', User.ignoreKwEmails);
  
  /* POST */
  router.post('/users', Login.createUser);
  router.post('/signin', Login.signin);
  router.post('/password/reset', Login.resetPassword);
  router.post('/password/reset/:uid', Login.makeNewPassword);
  router.post('/article/preview', Views.sendArticlesPreview);
  router.post('/api/user/marketing', User.appendMarketingCampaign);
  router.post('/api/expertise/add', User.migrateApprovedItem);
  router.post('/api/social/:direction', Social.sendSocialMediaBlast);
  
  /* PUT */
  router.put('/api/user/autobot', User.setAutoBot);
  router.put('/api/user/profile', User.updateUser);
  router.put('/api/user/expertise', User.updateExpertiseSubject);
  router.put('/api/post/:type/:id', User.editPostItemBody);
  router.put('/api/user/fbtok', Social.updateFbTok);
  router.put('/api/user/configs', Social.updateSocialConfigs);

  /* DELETE */
  router['delete']('/api/user/delete/:direction', User.deleteItem);

  return router;
};
