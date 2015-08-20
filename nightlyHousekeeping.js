/* 
	channel+ © 2015
	nightly cleanup

	- update twPostsToday
	- update fbPostsToday
	- update totalOutreach

	w = weeklyPostSummary
	totalOutreach = w[0]*rand100 + w[1]*rand50 + w[2]*rand20 + w[3]*rand10 + w[4]*rand5 + w[5]*rand2 + w[6]

	- update weeklyPostSummary

*/

const User = require('./app/models/user').User;
const stream = User.find().stream();
const dateNow = new Date;
var _ceiling = 0;

User.count({}, function(err, ceiling) {
	if (err) return null;
	stream.on('data', function (doc) {
		_ceiling += 1;

		// cleanup articles over 3 days
		const rawMarketingCampsLn = doc.marketingCampaigns && doc.marketingCampaigns.length || 0;
		const rawPast3Ln = doc.pastThreeDays && doc.pastThreeDays.length || 0;
		const EXPIRATION_TIME = 60 * 60 * 1000 * 24 * rawMarketingCampsLn;

		for (var i = rawPast3Ln - 1; i >= 0; i--) {
			if (doc.pastThreeDays[i] && doc.pastThreeDays[i].date) {
				if (dateNow - doc.pastThreeDays[i].date > EXPIRATION_TIME) doc.pastThreeDays.splice(i, 1);
			};
		};

		// do something with the mongoose document
		doc.twPostsToday = 0;
		doc.fbPostsToday = 0;

		doc.weeklyPostSummary = doc.weeklyPostSummary || [];

		w0 = doc.weeklyPostSummary[0] || 0;
		w1 = doc.weeklyPostSummary[1] || 0;
		w2 = doc.weeklyPostSummary[2] || 0;
		w3 = doc.weeklyPostSummary[3] || 0;
		w4 = doc.weeklyPostSummary[4] || 0;
		w5 = doc.weeklyPostSummary[5] || 0;

		doc.weeklyPostSummary = [0, w0, w1, w2, w3, w4];

		w0 = w0 * (Math.random() * 5);
		w1 = w1 * (Math.random() * 3);
		w2 = w2 * (Math.random() * 2);
		w3 = w3 * (Math.random() * 1);
		w4 = w4 * (Math.random() * 1);
		w5 = w5 * (Math.random() * 1);

		doc.totalOutreach += (w0 + w1 + w2 + w3 + w4 + w5);
		doc.totalOutreach = Math.floor(doc.totalOutreach);
		doc.markModified('weeklyPostSummary');
		doc.markModified('pastThreeDays');
		doc.save();

		setTimeout(function() {
			if (_ceiling === ceiling) process.exit();
		}, 1500);

	}).on('error', function (err) {
		  // handle the error
		  console.log(err);
	}).on('close', function () {
		  // the stream is closed
		  console.log('finished nightlyHouskeeping', new Date);
	});
});