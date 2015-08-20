#!/usr/bin/env node

/*
channel+ © 2015

users with vague keywords email helper
*/

// need Articles and Users
const Users = require('../app/models/user').User;
const dateNow = new Date();
const TEN_DAYS = 60 * 60 * 1000 * 24 * 10;
const TWO_DAYS = 60 * 60 * 1000 * 24 * 2;
const config = require('../config/config'),
    config = config.mandrill;
const mandrill = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(config.key);

// create read all users
const stream = Users.find().stream();
var _ceiling = 0;

User.count({}, function(err, ceiling) { 
  stream.on('data', function (doc) {
    _ceiling += 1;

    // if email < 10 days ago, skip
    doc.customerOutreach = doc.customerOutreach || {};
    doc.customerOutreach.keywordHelp = doc.customerOutreach.keywordHelp || {};
    doc.customerOutreach.keywordHelp.ignore = doc.customerOutreach.keywordHelp.ignore || false;
    if (! doc.customerOutreach.keywordHelp.ignore) {
      if (!doc.customerOutreach.keywordHelp.date || (dateNow - doc.customerOutreach.keywordHelp.date) > TEN_DAYS) {
        doc.customerOutreach.keywordHelp.date = new Date;

        // split keyword
        var keyword = doc.newsfeedKeyword || '';
        keyword = keyword.split(' ') || [];
        if (keyword.length < 3) {
          var txtMsg;
          var htmlMsg;
          if (!keyword[0]) {

            // give the user a couple days
            if (dateNow - doc.created > TWO_DAYS) {

              // user has no keyword
              txtMsg = 'We noticed it\'s been a couple days since you registered, and you have not yet defined a keyword. By having a keyword, you\'ll be able to select from up to date articles specific to your subject matter to stay up to date with your industry. It will be important to define a keyword specific enough to gain the maximum benefit of establishing your domain expertise. Check out our "Help Secion" for assistance in configuring your keyword.\n\n- the Channel+ team';
              htmlMsg = '<!DOCTYPE html><html xmlns=http://www.w3.org/1999/xhtml><head><meta name=viewport content="width=device-width"><meta http-equiv=Content-Type content="text/html; charset=UTF-8"><title>Channel+ Keyword Alert</title><style>*{margin:0;padding:0;font-family:"Helvetica Neue",Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.6}img{max-width:100%}body{-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:none;width:100%!important;height:100%}a{color:#348eda}.btn-primary{text-decoration:none;color:#FFF;background-color:#348eda;border:solid #348eda;border-width:10px 20px;line-height:2;font-weight:700;margin-right:10px;text-align:center;cursor:pointer;display:inline-block;border-radius:25px}.btn-secondary{text-decoration:none;color:#FFF;background-color:#aaa;border:solid #aaa;border-width:10px 20px;line-height:2;font-weight:700;margin-right:10px;text-align:center;cursor:pointer;display:inline-block;border-radius:25px}.last{margin-bottom:0}.first{margin-top:0}.padding{padding:10px 0}table.body-wrap{width:100%;padding:20px}table.body-wrap .container{border:1px solid #f0f0f0}table.footer-wrap{width:100%;clear:both!important}.footer-wrap .container p{font-size:12px;color:#666}table.footer-wrap a{color:#999}h1,h2,h3{font-family:"Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;color:#000;margin:40px 0 10px;line-height:1.2;font-weight:200}h1{font-size:36px}h2{font-size:28px}h3{font-size:22px}ol,p,ul{margin-bottom:10px;font-weight:400;font-size:14px}ol li,ul li{margin-left:5px;list-style-position:inside}.container{display:block!important;max-width:600px!important;margin:0 auto!important;clear:both!important}.body-wrap .container{padding:20px}.content{max-width:600px;margin:0 auto;display:block}.content table{width:100%}</style><body bgcolor=#f6f6f6><table class=body-wrap bgcolor=#f6f6f6><tr><td><td class=container bgcolor=#FFFFFF><div class=content><table><tr><td><p><strong>We noticed it\'s been a couple days since you registered,</strong></p><h2>and you have not yet defined a keyword.</h2></table><p>By having a keyword, you\'ll be able to select from up to date articles specific to your subject matter to stay up to date with your industry.<br><br>It will be important to define a keyword specific enough to gain the maximum benefit of establishing your domain expertise. Check out our "Help Secion" for assistance in configuring your keyword.</p><br><p>- the Channel+ team</p><p><a href=http://twitter.com/channelplusio>Follow @channelplusio on Twitter</a></p></table></div><td></table></body></html>';
            } 
          } else {
            var url = "http://channelplus.io/ignore/kw/" + doc._id;
            txtMsg = 'It\'s come to our attention you may not be maximizing your subject area domain expertise. Analysis of your keyword indicates it may be too vague to maximize full benefits. If you are satisfied with your articles, and no longer wish to receieve emails regarding your keyword, please visit: ' + url + '. Otherwise, please check out our "Help Section" for assistance how to improve your presence in the subject matter expertise for your area of "' + keyword.join(' ') + '".';
            htmlMsg = '<!DOCTYPE html><html xmlns=http://www.w3.org/1999/xhtml><head><meta name=viewport content="width=device-width"><meta http-equiv=Content-Type content="text/html; charset=UTF-8"><title>Channel+ Keyword Alert</title><style>*{margin:0;padding:0;font-family:"Helvetica Neue",Helvetica,Helvetica,Arial,sans-serif;font-size:100%;line-height:1.6}img{max-width:100%}body{-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:none;width:100%!important;height:100%}a{color:#348eda}.btn-primary{text-decoration:none;color:#FFF;background-color:#348eda;border:solid #348eda;border-width:10px 20px;line-height:2;font-weight:700;margin-right:10px;text-align:center;cursor:pointer;display:inline-block;border-radius:25px}.btn-secondary{text-decoration:none;color:#FFF;background-color:#aaa;border:solid #aaa;border-width:10px 20px;line-height:2;font-weight:700;margin-right:10px;text-align:center;cursor:pointer;display:inline-block;border-radius:25px}.last{margin-bottom:0}.first{margin-top:0}.padding{padding:10px 0}table.body-wrap{width:100%;padding:20px}table.body-wrap .container{border:1px solid #f0f0f0}table.footer-wrap{width:100%;clear:both!important}.footer-wrap .container p{font-size:12px;color:#666}table.footer-wrap a{color:#999}h1,h2,h3{font-family:"Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;color:#000;margin:40px 0 10px;line-height:1.2;font-weight:200}h1{font-size:36px}h2{font-size:28px}h3{font-size:22px}ol,p,ul{margin-bottom:10px;font-weight:400;font-size:14px}ol li,ul li{margin-left:5px;list-style-position:inside}.container{display:block!important;max-width:600px!important;margin:0 auto!important;clear:both!important}.body-wrap .container{padding:20px}.content{max-width:600px;margin:0 auto;display:block}.content table{width:100%}</style><body bgcolor=#f6f6f6><table class=body-wrap bgcolor=#f6f6f6><tr><td><td class=container bgcolor=#FFFFFF><div class=content><table><tr><td><p><strong>It came to our attention you may not be maximizing your subject area domain expertise.</strong></p><h2>Analysis of your keyword indicates it may be too vague to maximize full benefits.</h2></table><p>If you are satisfied with your articles, and no longer wish to receieve emails regarding your keyword, please click the "Ignore Keyword Warnings" link below.<br><br>Otherwise, please check out our "Help Section" for assistance how to improve your presence in the subject matter expertise for your area of "' + keyword.join(' ') + '".</p><table><tr><td class=padding><p><a href="' + url + '"class=btn-primary>Ignore Keyword Warnings</a></p></table><br><p>- the Channel+ team</p><p><a href=http://twitter.com/channelplusio>Follow @channelplusio on Twitter</a></p></table></div><td></table></body></html>';
          };

          var message = {
            "html": htmlMsg,
            "text": txtMsg,
            "subject": "Keyword Settings Alert on Channel+",
            "from_email": config.admin.email,
            "from_name": "Channel+ IO",
            "to": [
                {
                    "email": doc.email,
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
                    "rcpt": doc.email,
                    "values": {
                        "user_id": doc._id
                    }
                }
            ],
            "attachments": null,
            "images": null
          }

          var send_at = send_at;
          mandrill_client.messages.send({"message": message, "async": false, "ip_pool": null, "send_at": send_at}, function(result) {
            doc.markModified('customerOutreach');
            doc.save();
          }, function(e) {

          });
        };
      };
    };

    setTimeout(function() {
      if (_ceiling === ceiling) process.exit();
    }, 1500);

  }).on('error', function (err) {
    // handle the error
    console.log('err')
  }).on('close', function () {
    // the stream is closed
    console.log('finished keywordOutreach', new Date)
  });
});