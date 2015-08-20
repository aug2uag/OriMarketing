/*
channel+ © 2015

cron processes
*/

var CronJob = require('cron').CronJob;

// tests

try {
    new CronJob('invalid cron pattern', function() {
        console.log('this should not be printed');
    })

} catch(ex) {
    console.log("cron pattern not valid, text");
}

try {
    new CronJob('3,12,26,44 5-20 * * *', function() {
        console.log('3,12,26,44 5-20 * * *');
    })

} catch(ex) {
    console.log("cron pattern not valid, business hours");
}

try {
    new CronJob('00 54 * * *', function() {
        console.log('00 54 * * *');
    })

} catch(ex) {
    console.log("cron pattern not valid, daily('00 54 * * *')");
}

try {
    new CronJob('@daily', function() {
        console.log('@daily');
    })

} catch(ex) {
    console.log("cron pattern not valid, daily");
}


/* everyday during working hours, ~ q 15 min */
new CronJob('3,12,26,44 5-20 * * *', function(){
	/* hourly posts */
	var exec = require('child_process').exec;
	var child = exec('node ./cronPosts.js');
	child.stdout.on('data', function(data) {
	    console.log('stdout: ' + data);
	});
	child.stderr.on('data', function(data) {
	    console.log('stdout: ' + data);
	});
	child.on('close', function(code) {
	    console.log('closing code: ' + code);
	    child.kill();
	});

}, null, true, 'America/Los_Angeles');


/* daily to update stats */
new CronJob('00 00 * * *', function() {
	/* daily housekeeping */
	var exec = require('child_process').exec;
	var child = exec('node ./nightlyHousekeeping.js');
	child.stdout.on('data', function(data) {
	    console.log('stdout: ' + data);
	});
	child.stderr.on('data', function(data) {
	    console.log('stdout: ' + data);
	});
	child.on('close', function(code) {
	    console.log('closing code: ' + code);
	    child.kill();
	});

}, null, true, 'America/Los_Angeles')


/* keywords check */
new CronJob('00 23 */2 */3 *', function() {
	/* qod */
	var exec = require('child_process').exec;
	var child = exec('node ./outreach/keywordOutreach.js');
	child.stdout.on('data', function(data) {
	    console.log('stdout: ' + data);
	});
	child.stderr.on('data', function(data) {
	    console.log('stdout: ' + data);
	});
	child.on('close', function(code) {
	    console.log('closing code: ' + code);
	    child.kill();
	});

}, null, true, 'America/Los_Angeles')