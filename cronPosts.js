/*
channel+ © 2015

Automated FB/Twitter bots

send news articles in queue
send greetings in queue
*/

const User = require('./app/models/user').User;
const Utils = require('./app/lib/utils');
const stream = User.find().stream();
const dateNow = new Date;
const ONE_HOUR = 60 * 60 * 1000;
const TWO_HOURS = ONE_HOUR * 2;
const THREE_HOURS = ONE_HOUR * 3;
const SIX_HOURS = ONE_HOUR * 6;
const FORTYFIVE_MINS = 60 * 45 * 1000;
const THREE_DAYS = ONE_HOUR * 24 * 3;
var _ceiling = 0;

User.count({}, function(err, ceiling) {
	if (err) return null;
	stream.on('data', function (doc) {
		_ceiling += 1;

		// process each article
	  	var fbOK = false, twOK = false;
	  	if (doc.fbAID && doc.fbKey && doc.fbID && doc.fbSec && doc.fbNom) fbOK = true;
	  	if (doc.twKey && doc.twSec && doc.twToK && doc.twToS) twOK = true;

	  	doc.pastThreeDays = doc.pastThreeDays || [];
		const past3 = doc.pastThreeDays || [];
		const newsfeedApproved = doc.newsfeedApproved || [];
		const marketingCampaigns = doc.marketingCampaigns || [];
		const timeLastPost = doc.timeLastPost || new Date(1990);

	  	// if autobot and !marketing
	  	if (fbOK && twOK && doc.setAutoBot && newsfeedApproved.length > 0 && marketingCampaigns.length === 0) {
	  		// post q1h
			if (dateNow - timeLastPost < ONE_HOUR) return null;
			else return postNewsfeed();
	  	};

		// do not post the same content within 3 days
		// from marketing
		function doRemoveDups(_arr1, _arr2) {
			_arr1.sort(function(a, b){return b-a});
			_arr1.forEach(function(i) {
				_arr2.splice(i, 1);
			});
		};

		var _count = 0, idxHolder = [];
		marketingCampaigns.forEach(function(item, idx) {
			_count += 1;
			for (var j = 0; j < past3.length; j++) {
				if (past3[j].type === 'campaign' && past3[j]._id === item['_id']) {
					idxHolder.push(idx);
				};
			};
			if (_count === marketingCampaigns.length) doRemoveDups(idxHolder, marketingCampaigns);
		});

		// and from newsfeed
		_count = 0, idxHolder = [];
		newsfeedApproved.forEach(function(item, idx) {
			_count += 1;
			for (var j = 0; j < past3.length; j++) {
				if (past3[j].type === 'newsfeed' && past3[j].link === item['url']) {
					idxHolder.push(idx);
				};
			};
			if (_count === newsfeedApproved.length) doRemoveDups(idxHolder, newsfeedApproved);
		});

		// if interval or not enough items
		const lnNewsfeed = newsfeedApproved.length;
		const lnCampaigns = marketingCampaigns.length;
		const totalLnItems = lnNewsfeed + lnCampaigns;
		const dateLastCampaignPost = doc.lastCampaignPost;
		const dateLastNewsfeedPost = doc.lastNewsfeedPost;

		var timeInterval = doc.setPostInterval;
		if (!timeInterval) timeInterval = totalLnItems > 100 ? ONE_HOUR/4 : totalLnItems > 50 ? ONE_HOUR/2 : totalLnItems > 20 ? ONE_HOUR : TWO_HOURS;
		if (dateNow - timeLastPost < timeInterval) return null;

		if (newsfeedApproved || marketingCampaigns) {

			// handle multiple serial posts
			var totalCounts = marketingCampaigns.length + newsfeedApproved.length;

			// infrequent posts at undesirable times
			const validBusHoursAmerica = [7,8,9,10,11,12,13,14,15,16];
			const isInvalidHours = validBusHoursAmerica.indexOf(dateNow.getHours()) === -1 ? true : false;

			const invalidBusDays = [7];
			const isInvalidBusDay = invalidBusDays.indexOf(dateNow.getDay()) > -1 ? true : false;

			const isLaggardTimeOrDay = isInvalidHours || isInvalidBusDay ? true : false;

			// get last 3 posts to know whether they are campaign or newsfeed
			var past_1 = past3[0] || {};
			var past_2 = past3[1] || {};
			var past_3 = past3[2] || {};

			past_1.type = past_1.type || 'none';
			past_2.type = past_2.type || 'none';
			past_3.type = past_3.type || 'none';

			var types = [past_1.type, past_2.type, past_3.type];
			// console.log('types', types, '\n\n');

			var counts = {};
			types.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });

			// do post
			function postNewsfeed() {
				var randIndex = Math.floor(Math.random()*newsfeedApproved.length)
				// make post with marketingCampaigns[randIndex]
				var articleItem = newsfeedApproved[randIndex];
				articleItem.fbOK = fbOK;
				articleItem.twOK = twOK;
				if (fbOK || twOK) {
					// console.log(new Array(20).join("news "))
					// console.log(articleItem)
					Utils.newsfeedPostFromCron(doc, articleItem);
					doc.newsfeedApproved.splice(randIndex, 1);
					doc.pastThreeDays.unshift({type: 'newsfeed', date: dateNow, link: articleItem.url, _id: articleItem._id});
					doc.markModified('newsfeedApproved');
					doc.markModified('pastThreeDays');
					doc.lastNewsfeedPost = dateNow;
					doc.timeLastPost = dateNow;
					doc.save();
				};
				return true;
			}

			function postCampaign() {
				var randIndex = Math.floor(Math.random()*marketingCampaigns.length)
				// make post with marketingCampaigns[randIndex]
				var campaignItem = marketingCampaigns[randIndex];
				campaignItem.fbOK = fbOK;
				campaignItem.twOK = twOK;
				if (fbOK || twOK) {
					// console.log(new Array(20).join("camp "))
					// console.log(campaignItem)
					Utils.marketingPostFromCron(doc, campaignItem);
					doc.pastThreeDays.unshift({type: 'campaign', date: dateNow, _id: campaignItem._id});
					doc.markModified('pastThreeDays');
					doc.lastCampaignPost = dateNow;
					doc.timeLastPost = dateNow;
					doc.save();
				};
				return true;
			};

			// decided to do post
			function decideNewsfeed() {
				if (!newsfeedApproved || lnNewsfeed === 0) return null;
				if (isLaggardTimeOrDay && dateNow - dateLastCampaignPost < THREE_HOURS) return null;
				return postNewsfeed();
			};

			function decideCampaign() {
				if (!marketingCampaigns || lnCampaigns === 0) return null;
				if (lnCampaigns > 20) return postCampaign();
				if (isLaggardTimeOrDay && dateNow - dateLastCampaignPost < THREE_HOURS) return null;
				if (lnCampaigns >= 10 && !dateLastCampaignPost) return postCampaign();
				if (lnCampaigns >= 10 && (dateNow - dateLastCampaignPost > TWO_HOURS || dateNow - timeLastPost > ONE_HOUR)) return postCampaign();
				if (lnCampaigns < 10 && !dateLastCampaignPost) return postCampaign();
				if (lnCampaigns < 10 && dateLastCampaignPost) {
					if (lnCampaigns < 5 && (dateNow - dateLastCampaignPost > SIX_HOURS || dateNow - timeLastPost > THREE_HOURS)) return postCampaign();
					if (lnCampaigns >= 5 && (dateNow - dateLastCampaignPost > THREE_HOURS || dateNow - timeLastPost > TWO_HOURS)) return postCampaign();
				};
				return null;
			};

			/* LOGIC TO POST */

			// if not campaigns, post newsfeed
			if (!marketingCampaigns || lnCampaigns === 0) {
				return decideNewsfeed();
			}

			// if not newsfeed, post campaign
			else if (!newsfeedApproved || lnNewsfeed === 0) {
				return decideCampaign();
			}

			else {
				// both newsfeed and campaigns present
				// type = campaign | newsfeed
				// should decide on how to post based on campaign length
				if (lnCampaigns > lnNewsfeed) {
					// many campaigns
					var randFactor = Math.floor(Math.random() * 2) + 1;
					if (counts['campaign'] >= randFactor) {
						var notNull = decideNewsfeed();
						if (!notNull) return decideCampaign();
					} else {
						var notNull = decideCampaign();
						if (!notNull) return decideNewsfeed();
					}
				} else {
					// if many newsfeed, should post newsfeed
					// should post campaign based on len * 3 hours if > 3 else len * 6
					var notNull = decideNewsfeed();
					if (!notNull) return decideCampaign();
				};
			};
		};

		setTimeout(function() {
			if (_ceiling === ceiling) process.exit();
		}, 1500);

	}).on('error', function (err) {
		// handle the error
		console.log(err);
	}).on('close', function () {
		// the stream is closed
		console.log('finished cronPosts', new Date)
	});
});

