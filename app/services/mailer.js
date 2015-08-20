#!/usr/bin/env node
/*
channel+ © 2015
*/

var config = require('../../config/config'),
    config = config.mandrill,
    mandrill = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(config.key),
    send_at = new Date();


exports.sendActivationEmail = function(user, token) {
  var url = "http://channelplus.io/verify/" + user._id;
  var htmlBody = '<!DOCTYPE html><html xmlns=http://www.w3.org/1999/xhtml><head><meta name=viewport content="width=device-width"><meta http-equiv=Content-Type content="text/html; charset=UTF-8"><title>Channel+ Email Verification</title><style>*{margin:0;padding:0;font-family:"Helvetica Neue",Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.6}img{max-width:100%}body{-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:none;width:100%!important;height:100%}a{color:#348eda}.btn-primary{text-decoration:none;color:#FFF;background-color:#348eda;border:solid #348eda;border-width:10px 20px;line-height:2;font-weight:700;margin-right:10px;text-align:center;cursor:pointer;display:inline-block;border-radius:25px}.btn-secondary{text-decoration:none;color:#FFF;background-color:#aaa;border:solid #aaa;border-width:10px 20px;line-height:2;font-weight:700;margin-right:10px;text-align:center;cursor:pointer;display:inline-block;border-radius:25px}.last{margin-bottom:0}.first{margin-top:0}.padding{padding:10px 0}table.body-wrap{width:100%;padding:20px}table.body-wrap .container{border:1px solid #f0f0f0}table.footer-wrap{width:100%;clear:both!important}.footer-wrap .container p{font-size:12px;color:#666}table.footer-wrap a{color:#999}h1,h2,h3{font-family:"Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;color:#000;margin:40px 0 10px;line-height:1.2;font-weight:200}h1{font-size:36px}h2{font-size:28px}h3{font-size:22px}ol,p,ul{margin-bottom:10px;font-weight:400;font-size:14px}ol li,ul li{margin-left:5px;list-style-position:inside}.container{display:block!important;max-width:600px!important;margin:0 auto!important;clear:both!important}.body-wrap .container{padding:20px}.content{max-width:600px;margin:0 auto;display:block}.content table{width:100%}</style><body bgcolor=#f6f6f6><table class=body-wrap bgcolor=#f6f6f6><tr><td><td class=container bgcolor=#FFFFFF><div class=content><table><tr><td><h1>Hi there.</h1><p>This email was used to register an account at channelplus.io and requires verification.</p><h2>To conclude registration ..</h2><p>Please click on the link or button below.</p><table><tr><td class=padding><p><a href="' + url + '"class=btn-primary>Click here to verify email and finish registration</a></p></table><p>Feel free to use Channel+ as much as you wish during your 14 day free trial.</p><p>Thanks, have a lovely day.</p><p><a href=http://twitter.com/channelplusio>Follow @channelplusio on Twitter</a></p></table></div><td></table></body></html>Channel+ © 2015';
  var txtBody = 'Hi!\n\nPlease verify your registration for Channel+ by visiting the following url:\n\n' + url + 'Use Channel+ as much as you wish during your 14 day free trial, and please contact us anytime.\n\nThanks! Have a lovely day.\n\n@channelplusio';
  var message = {
    "html": htmlBody,
    "text": txtBody,
    "subject": "Finalize Registration for Channel+",
    "from_email": config.admin.email,
    "from_name": "Channel+ IO",
    "to": [
        {
            "email": user.email,
            "name": "New Channel+ Registree",
            "type": "to"
        }
    ],
    "headers": {
        "Reply-To": config.admin.email
    },
    "important": false,
    "track_opens": null,
    "track_clicks": null,
    "auto_text": true,
    "auto_html": true,
    "inline_css": true,
    "url_strip_qs": null,
    "preserve_recipients": null,
    "view_content_link": null,
    "bcc_address": null,
    "tracking_domain": null,
    "signing_domain": null,
    "return_path_domain": null,
    "merge": true,
    "merge_language": null,
    "global_merge_vars": null,
    "merge_vars": null,
    "tags": [
        "email-verification"
    ],
    "subaccount": null,
    "google_analytics_domains": [
        "channelplus.io"
    ],
    "google_analytics_campaign": config.admin.email,
    "metadata": {
        "website": "channelplus.io"
    },
    "recipient_metadata": [
        {
            "rcpt": user.email,
            "values": {
                "user_id": user._id
            }
        }
    ],
    "attachments": null,
    "images": null
  }
  var async = false;
  var ip_pool = null;
  var send_at = send_at;
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
    console.log(result);
    /*
    [{
            "email": "recipient.email@example.com",
            "status": "sent",
            "reject_reason": "hard-bounce",
            "_id": "abc123abc123abc123abc123abc123"
        }]
    */
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
};


exports.resetPasswordEmail = function(user, token) {
  var url = "http://channelplus.io/reset/" + user._id + "/" + token;
  var htmlBody = '<!DOCTYPE html><html xmlns=http://www.w3.org/1999/xhtml><head><meta name=viewport content="width=device-width"><meta http-equiv=Content-Type content="text/html; charset=UTF-8"><title>Channel+ Password Reset</title><style>*{margin:0;padding:0;font-family:"Helvetica Neue",Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.6}img{max-width:100%}body{-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:none;width:100%!important;height:100%}a{color:#348eda}.btn-primary{text-decoration:none;color:#FFF;background-color:#348eda;border:solid #348eda;border-width:10px 20px;line-height:2;font-weight:700;margin-right:10px;text-align:center;cursor:pointer;display:inline-block;border-radius:25px}.btn-secondary{text-decoration:none;color:#FFF;background-color:#aaa;border:solid #aaa;border-width:10px 20px;line-height:2;font-weight:700;margin-right:10px;text-align:center;cursor:pointer;display:inline-block;border-radius:25px}.last{margin-bottom:0}.first{margin-top:0}.padding{padding:10px 0}table.body-wrap{width:100%;padding:20px}table.body-wrap .container{border:1px solid #f0f0f0}table.footer-wrap{width:100%;clear:both!important}.footer-wrap .container p{font-size:12px;color:#666}table.footer-wrap a{color:#999}h1,h2,h3{font-family:"Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;color:#000;margin:40px 0 10px;line-height:1.2;font-weight:200}h1{font-size:36px}h2{font-size:28px}h3{font-size:22px}ol,p,ul{margin-bottom:10px;font-weight:400;font-size:14px}ol li,ul li{margin-left:5px;list-style-position:inside}.container{display:block!important;max-width:600px!important;margin:0 auto!important;clear:both!important}.body-wrap .container{padding:20px}.content{max-width:600px;margin:0 auto;display:block}.content table{width:100%}</style><body bgcolor=#f6f6f6><table class=body-wrap bgcolor=#f6f6f6><tr><td><td class=container bgcolor=#FFFFFF><div class=content><table><tr><td><h2>To reset your Channel+ password ..</h2><p>Please click on the link or button below.</p><table><tr><td class=padding><p><a href="' + url + '"class=btn-primary>Click here to continue to password reset</a></p></table><p>Password reset expires 24 hours after time of request.</p><p>Thanks, have a lovely day.</p><p><a href=http://twitter.com/channelplusio>Follow @channelplusio on Twitter</a></p></table></div><td></table></body></html>';
  var txtBody = 'Please verify your registration for Channel+ by visiting the following url:\n\n' + url + '\n\nThanks!\n\n@channelplusio';
  var message = {
    "html": htmlBody,
    "text": txtBody,
    "subject": "Password Reset for Channel+",
    "from_email": config.admin.email,
    "from_name": "Channel+ IO",
    "to": [
        {
            "email": user.email,
            "name": "Beloved Channel+ user",
            "type": "to"
        }
    ],
    "headers": {
        "Reply-To": config.admin.email
    },
    "important": false,
    "track_opens": null,
    "track_clicks": null,
    "auto_text": true,
    "auto_html": true,
    "inline_css": true,
    "url_strip_qs": null,
    "preserve_recipients": null,
    "view_content_link": null,
    "bcc_address": null,
    "tracking_domain": null,
    "signing_domain": null,
    "return_path_domain": null,
    "merge": true,
    "merge_language": null,
    "global_merge_vars": null,
    "merge_vars": null,
    "tags": [
        "email-verification"
    ],
    "subaccount": null,
    "google_analytics_domains": [
        "channelplus.io"
    ],
    "google_analytics_campaign": config.admin.email,
    "metadata": {
        "website": "channelplus.io"
    },
    "recipient_metadata": [
        {
            "rcpt": user.email,
            "values": {
                "user_id": user._id
            }
        }
    ],
    "attachments": null,
    "images": null
  }
  var async = false;
  var ip_pool = null;
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
    console.log(result);
    /*
    [{
            "email": "recipient.email@example.com",
            "status": "sent",
            "reject_reason": "hard-bounce",
            "_id": "abc123abc123abc123abc123abc123"
        }]
    */
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
};


exports.userNotificationEmail = function(user, callback) {
  var message = {}
  SmtpTransport.API.sendTemplate('user-notification', message, callback);
};

