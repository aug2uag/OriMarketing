/* channel+ © 2015 */

/*

	GENERAL BOILERPLATE

*/
/* general boilerplate */
function generateErrModal(msg, callback) {
	var insert = '<div>' + msg + ' </div>'
	var dialog = new BootstrapDialog({
        message: function(dialogRef){
            var $message = $(insert);
            var $button = $('<button class="btn btn-danger btn-lg btn-block">Close</button>');
            $button.on('click', {dialogRef: dialogRef}, function(event){
                event.data.dialogRef.close();
                callback();
            });
            $message.append($button);
    
            return $message;
        },
        closable: false
    });
    dialog.realize();
    dialog.getModalHeader().hide();
    dialog.getModalFooter().hide();
    dialog.getModalBody().css('background-color', '#cc0022');
    dialog.getModalBody().css('color', '#fff');
    dialog.open();
};

function windowTokenStorage(action, token) {
	if (window.localStorage) {
		if (action === 'set') {
			window.localStorage.setItem('token', token);
		} else if (action === 'get') {
			return window.localStorage.getItem('token');
		} else {
			window.localStorage.clear();
		};
	};
};

function doLogout() {
	windowTokenStorage('clear');
	window.location.assign('/signin');
};

function makeRequestWithHeaders(requestObject, requestMethod, url, requestBody) {
	requestObject.open(url, requestMethod, true);
	var navToken = window.localStorage.getItem('token');	
	requestObject.setRequestHeader("Authorization", ('Bearer ' + navToken));
	if (requestBody) {
		requestObject.setRequestHeader("Content-type","application/json");
		return requestObject.send(JSON.stringify(requestBody));
	};
	requestObject.send();
};

/* home boilerplate */
function getAuthenticated(callback) {
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, '/api/user', 'GET');
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status === 200) {
				var data = JSON.parse(requestObject.responseText);
				callback(null, data);
			} else {
				generateErrModal('please sign in', function() {
					callback(true);
				});
			};
		};
	};
};

/* config boilerplate */
function getSocialConfigStatus(callback) {
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, '/api/user/configs', 'GET');
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status === 200) {
				var data = JSON.parse(requestObject.responseText);
				callback(null, data);
			} else {
				generateErrModal('network error, please check connection. you will now be logged out.', function() {
					callback(true);
				});
			};
		};
	};
};

function updateUserFbToken(options, callback) {
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, '/api/user/fbtok', 'PUT', options);
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status === 200) {
				callback(null);
			} else {
				generateErrModal('unable to update your Facebook Token. check configurations and try again.', function() {
					window.location.assign('/config');
				});
			};
		};
	};
};

/* marketing boilerplate */
function getMarketingCampaigns(callback) {
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, '/api/marketing', 'GET');
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status === 200) {
				var data = JSON.parse(requestObject.responseText);
				callback(null, data);
			} else {
				generateErrModal('network error, please check connection. you will now be logged out.', function() {
					callback(true);
				});
			};
		};
	};
};

function updateMarketing(options) {
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, '/api/user/marketing', 'POST', options);
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status === 200) {
				var data = JSON.parse(requestObject.responseText);
				data.direction = 'marketing';
				appendNewItem(data);
			} else {
				generateErrModal('network error, please check connection. you will now be logged out.', function() {
					callback(true);
				});
			};
		};
	};
};

function editMarketing(options, callback) {
	var url = '/api/post/' + options.type + '/' + options.id;
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, url, 'PUT', options);
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status === 200) {
				var data = JSON.parse(requestObject.responseText);
				callback(null, data);
			} else {
				generateErrModal('network error, please check connection and try again.', function() {
					callback(true);
				});
			};
		};
	};
};

function deleteItem(options, direction) {
	var url = '/api/user/delete/' + direction;
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, url, 'DELETE', options);
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status !== 200) {
				generateErrModal('unable to delete item, check network and try again.');
			} else {
				removeItem(options.id);
			};
		};
	};
};

/* expertise specific */
function getDomainExpertise(callback) {
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, '/api/expertise', 'GET');
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status === 200) {
				var data = JSON.parse(requestObject.responseText);
				callback(null, data);
			} else {
				generateErrModal('network error, please check connection. you will now be logged out.', function() {
					callback(true);
				});
			};
		};
	};
};

function approveExpertiseItem(options, callback) {
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, '/api/expertise/add', 'POST', options);
	removeItem(options.id);
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status === 200) {
				try {
					var data = JSON.parse(requestObject.responseText);
					data.direction = 'approval';
					appendNewItem(data);
					setTimeout(function() {
						if (document.getElementsByClassName('aprBtn').length === 0) {
							emptyItemsList('pending');
						};
					}, 500);
				}

				catch(e) {
					console.log(e);
				}
			} else {
				generateErrModal('unable to make change, check network and try again.');
			};
		};
	};
};

function getTopicPreview(topic) {
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, '/article/preview', 'POST', {topic: topic});
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status === 200) {
				try{
					var data = JSON.parse(requestObject.responseText);
					var fillerHTML = '<div class="sdcontainer"><h2>Snippets relating to keyword</h2><p>If none of the snippets are relevant, improve your keyword</p><table class="table table-striped"><thead><tr><th><emphasis>Snippets</emphasis></th></tr></thead><tbody>';
					data.forEach(function(snippet) {
						fillerHTML = fillerHTML + '<tr><td>' + snippet + '</td></tr>';
					});
					fillerHTML += '</tbody></table></div>';
					BootstrapDialog.show({
						title: 'Keyword Evaluation',
						message: $(fillerHTML)
					});
				}

				catch(e) {
					BootstrapDialog.alert(e);
				}
			} else {
				generateErrModal('network error, please check connection. you will now be logged out.', function() {
					callback(true);
				});
			};
		};
	};
};

function updateExpertiseSubject(subject, callback) {
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, '/api/user/expertise', 'PUT', {kw: subject});
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status === 200) {
				var msg = 'Your expertise subject matter is successfully set to "' + subject + '"';
				BootstrapDialog.alert(msg, function() {
					callback(null);
				});
			} else {
				generateErrModal('network error, please check connection. you will now be logged out.', function() {
					callback(true);
				});
			};
		};
	};
};

function autobotUpdateScreen(val) {
	if (val) {
		fadeOut(document.getElementById('approved_content'));
		fadeOut(document.getElementById('pending_approval'));
		fadeOut(document.getElementById('hr1'));
		fadeOut(document.getElementById('hr2'));
		document.getElementById('botHeader').innerHTML = 'Auto bot mode is ON';
		document.getElementById('botHelper').innerHTML = '<strong><emphasis>articles are automatically posted without review</emphasis></strong>';
	} else {
		fadeIn(document.getElementById('approved_content'));
		fadeIn(document.getElementById('pending_approval'));
		fadeIn(document.getElementById('hr1'));
		fadeIn(document.getElementById('hr2'));
		document.getElementById('botHeader').innerHTML = 'Activate auto bot?';
		document.getElementById('botHelper').innerHTML = '<strong><emphasis>auto bot mode automatically approves and posts articles on your behalf</emphasis></strong>';
	};
};

function updateAutobot(val, callback) {
	var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	makeRequestWithHeaders(requestObject, '/api/user/autobot', 'PUT');
	requestObject.onreadystatechange = function() {
		if (requestObject.readyState === 4) {
			if (requestObject.status === 200) {
				autobotUpdateScreen(val);
			} else {
				generateErrModal('network error, please check connection and try again', function() {
					callback(true);
				});
			};
		};
	};
};

/* shared marketing and expertise on screen methods */
function approveOrEditPost(el, context, direction) {
	var _el, strPrepender, txtAreaBody, buttons;
	function editModalRequestOptions(approve) {
		var identifierTxt = 'text' + context.id;
    	var txtChange = document.getElementById(identifierTxt).value;
		editMarketing({type: direction, edit: txtChange, id: context.id, approve: approve}, function(err, data) {
			if (data && !('empty' in data) && direction === 'pending') onscreenChangePendingToApproved(data, context);
		});

		if (_el && strPrepender) {
			_el.innerHTML = strPrepender + txtChange;
		};
	};

	function onscreenChangePendingToApproved(data) {
		data.direction = 'approval';
		removeItem(context.id);
		appendNewItem(data);
		setTimeout(function() {
			if (document.getElementsByClassName('aprBtn').length === 0) {
				emptyItemsList('pending');
			};
		}, 500);
	};

	var closeAction = {
        label: 'Close',
        cssClass: 'btn-danger',
        hotkey: 13, // Enter.
        action: function(screenModal) {
    		screenModal.close();
        }
    }

    var editAction = {
        label: 'Save Changes',
        cssClass: 'btn-success',
        action: function(screenModal) {
        	editModalRequestOptions(false);
    		screenModal.close();
        }
    }

	if (direction === 'marketing') {
		strPrepender = '<u>Post</u>: ';
		_el = el.parentNode.parentNode.getElementsByTagName('h3')[0];
		txtAreaBody = _el.innerHTML.split(strPrepender)[1].trim();
		buttons = [editAction, closeAction];
	} else if (direction === 'approval') {
		strPrepender = '<u>Headline</u>: ';
		_el = el.parentNode.parentNode.getElementsByTagName('p')[1];
		txtAreaBody = _el.innerHTML.split(strPrepender)[1].trim();
		buttons = [editAction, {
            label: 'Save Changes and Add To Campaign!',
            cssClass: 'btn-primary',
            action: function(screenModal) {
            	editModalRequestOptions(true);
        		screenModal.close();
            }}, closeAction];
	} else if (direction === 'pending') {
		txtAreaBody = el.parentNode.parentNode.getElementsByTagName('p')[1].innerText.split('Headline: ')[1].trim();
		buttons = [{
            label: 'Approve Only',
            cssClass: 'btn-primary',
            action: function(screenModal) {
            	editModalRequestOptions(false);
        		screenModal.close();
            }}, {
            label: 'Approve and Add To Campaign!',
            cssClass: 'btn-primary',
            action: function(screenModal) {
            	editModalRequestOptions(true);
        		screenModal.close();
            }}, closeAction]
	}
	
	if (txtAreaBody && buttons) {
		BootstrapDialog.show({
		    title: '<strong style="text-decoration:underline;border-bottom: 0.9px solid #000;">Edit or approve default post</strong>',
		    message: $('<textarea id="text' + context.id + '" class="form-control">' + txtAreaBody + '</textarea>'),
		    buttons: buttons
		});
	};
};

function emptyItemsList(direction) {
	if (direction === 'marketing') document.getElementById('auto_post_announcement').innerHTML = '<strong>Create an item above, there are currently no items in queue.</strong><br><br>"Add to campaign" to insert items to post in queue.<br><br>';
	if (direction === 'approval') document.getElementById('approval_heading').innerHTML = '<strong>There are no articles in queue.</strong>';
	if (direction === 'pending') document.getElementById('pending_heading').innerHTML = '<strong>There are no articles awaiting approval.</strong><br><br><br><br>Insert a keyword to get started.<br><br>Articles are fetched once per day at 6:00 am GMT.<br><br>Check back daily to see articles pending approval.<br><br>';
};

function displayOnscreenItems(direction, arr) {
	if (arr.length === 0) return emptyItemsList(direction);
	var r = document.createElement("div");
	var classId;
	arr.forEach(function(item) {
		switch(direction) {
			case 'marketing':
				var x = destinationHumanReadable(item.destination);
				r.innerHTML += '<div class="thumbnail" id="' + item._id + '"><div class="caption"> <h3><u>Post</u>:  ' + item.body + '</h3><p><u>Auto-media</u>:  ' + item.autoMedia + '</p><p><u>Destination</u>:  ' + x + '<p><a id="' + item._id + '" class="btn btn-danger delbtn" func="del" role="button">Delete</a>&nbsp;<a id="' + item._id + '" class="btn btn-warning editBtn" func="del" role="button">Edit</a></p></div>';
				break;

			case 'approval':
				r.innerHTML += '<div class="thumbnail" id="' + item._id + '"><div class="caption"> <h3><u>Source</u>:  ' + item.source + '</h3><p><u>URL</u>:  ' + item.url + '</p><p><u>Headline</u>:  ' + item.text + '<p><a id="' + item._id + '" class="btn btn-danger delbtn" func="del" role="button">Delete</a>&nbsp;<a id="' + item._id + '" class="btn btn-warning editBtn" func="del" role="button">Edit</a></p></div>';
				break;

			case 'pending':
				r.innerHTML += '<div class="thumbnail thumbnail-pending" id="' + item._id + '"><div class="caption"> <h3><u>Source</u>:  ' + item.source + '</h3><p><u>URL</u>:  ' + item.url + '</p><p><u>Headline</u>:  ' + item.text + '<p><a id="' + item._id + '" class="btn btn-danger delBtnPending" func="del" role="button">Delete</a>&nbsp;<a id="' + item._id + '" class="btn btn-success aprBtn" func="del" role="button">Approve</a></p></div>';
				break;

			default :
				break;
		}
	});

	if (direction === 'marketing') {
		document.getElementById('auto_post_announcement').innerHTML = 'The following are scheduled for auto-post:';
		document.getElementById('marketing_posts').appendChild(r);
		classId = 'delbtn'
	};

	if (direction === 'approval') {
		document.getElementById('approval_heading').innerHTML = 'The following are scheduled for auto-post:';
		document.getElementById('approval_posts').appendChild(r);
		classId = 'delbtn';
	};

	if (direction === 'pending') {
		document.getElementById('pending_heading').innerHTML = 'The following articles are awaiting approval:';
		document.getElementById('pending_posts').appendChild(r);
		assignMigrates();
		classId = 'delBtnPending';
	};
	assignDeletes(direction, classId);
	if (direction !== 'pending') assignEdits(direction);
};

function appendNewItem(item) {
	var r = document.createElement("div");
	var x = destinationHumanReadable(item.destination);
	var classId;
	switch(item.direction) {
		case 'marketing':
			r.innerHTML += '<div class="thumbnail" id="' + item._id + '"> <div class="caption"> <h3><u>Post</u>:  ' + item.body + '</h3><p><u>Auto-media</u>:  ' + item.autoMedia + '</p><p><u>Destination</u>:  ' + x + '<p><a id="' + item._id + '" class="btn btn-danger delbtn" func="del" role="button">Delete</a>&nbsp;<a id="' + item._id + '" class="btn btn-warning editBtn" func="del" role="button">Edit</a></p></div>';
			break;

		case 'approval':
				r.innerHTML += '<div class="thumbnail" id="' + item._id + '"><div class="caption"> <h3><u>Source</u>:  ' + item.source + '</h3><p><u>URL</u>:  ' + item.url + '</p><p><u>Headline</u>:  ' + item.text + '<p><a id="' + item._id + '" class="btn btn-danger delbtn" func="del" role="button">Delete</a>&nbsp;<a id="' + item._id + '" class="btn btn-warning editBtn" func="del" role="button">Edit</a></p></div>';
				break;

		case 'pending':
			r.innerHTML += '<div class="thumbnail thumbnail-pending" id="' + item._id + '"><div class="caption"> <h3><u>Source</u>:  ' + item.source + '</h3><p><u>URL</u>:  ' + item.url + '</p><p><u>Headline</u>:  ' + item.text + '<p><a id="' + item._id + '" class="btn btn-danger delBtnPending" func="del" role="button">Delete</a>&nbsp;<a id="' + item._id + '" class="btn btn-success aprBtn" func="del" role="button">Approve</a></p></div>';
			break;

		default :
			break;
	}
	if (item.direction === 'marketing') {
		document.getElementById('auto_post_announcement').innerHTML = 'The following are scheduled for auto-post:';
		document.getElementById('marketing_posts').appendChild(r);
		classId = 'delbtn';
	};

	if (item.direction === 'approval') {
		document.getElementById('approval_heading').innerHTML = 'The following are scheduled for auto-post:';
		document.getElementById('approval_posts').appendChild(r);
		classId = 'delbtn';
	};

	if (item.direction === 'pending') {
		document.getElementById('pending_heading').innerHTML = 'The following are scheduled for auto-post:';
		document.getElementById('pending_posts').appendChild(r);
		classId = 'delBtnPending';
	};

	assignDeletes(item.direction, classId);
	if (item.direction !== 'pending') assignEdits(item.direction);
};

function removeItem(_id) {
	var el = document.getElementById(_id);
	el.parentNode.removeChild( el );
};

function assignDeletes(direction, classId) {
	var rawDelElems = document.getElementsByClassName(classId);
	var cleanElems = [];
	for (var i = 0; i < rawDelElems.length; i++) {
		cleanElems.push(rawDelElems[i]);
	};
	cleanElems.forEach(function(elem) {
		elem.onclick = function(e) {
			e.preventDefault();
			deleteItem({id: this.id}, direction);
			if (document.getElementsByClassName(classId).length === 1) {
				emptyItemsList(direction);
			};
		};
	});
};

function assignEdits(direction) {
	var edits = document.getElementsByClassName('editBtn');
	var _edits = [];
	for (var i = 0; i < edits.length; i++) {
		_edits.push(edits[i]);
	};
	_edits.forEach(function(elem) {
		elem.onclick = function(e) {
			e.preventDefault();
			approveOrEditPost(elem, this, direction);
		};
	});
};

function assignMigrates() {
	var rawDelElems = document.getElementsByClassName('aprBtn');
	var cleanElems = [];
	for (var i = 0; i < rawDelElems.length; i++) {
		cleanElems.push(rawDelElems[i]);
	};
	cleanElems.forEach(function(elem) {
		elem.onclick = function(e) {
			e.preventDefault();
			approveOrEditPost(elem, this, 'pending');
		};
	});
};

function fadeOut(el) {
	if (el.style.opacity < 1) return;
    var op = 1;
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            el.style.display = 'none';
        }
        el.style.opacity = op;
        el.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 5);
};

function fadeIn(el) {
    var op = 0.1;
    el.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        el.style.opacity = op;
        el.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 5);
};

/*

	BASE AUTHENTICATION

*/

if (document.getElementById('logout')) {
	document.getElementById('logout').onclick = function(e) {
		if (e.keyCode === 13) return false;
		e.preventDefault();
		var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		makeRequestWithHeaders(requestObject, '/api/users/signout', 'GET');
		requestObject.onreadystatechange = function() {
			doLogout();
		};
	};
};

if (document.getElementById('go-top')) {
	$('#go-top').click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
    });
};

if (document.getElementById('register_submit')) {
	document.getElementById('register_submit').onclick = function(e) {
		if (e.keyCode === 13) return false;
		e.preventDefault();
		var options = {
			email: document.getElementById('register_email').value,
			password: document.getElementById('register_password').value
		};
		var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		makeRequestWithHeaders(requestObject, '/users', 'POST', options);
		requestObject.onreadystatechange = function() {
			if (requestObject.readyState === 4) {
				if (requestObject.status === 200) {
					BootstrapDialog.alert('thank you for registering, a confirmation email will be sent out to you in a few moments. please confirm your email and sign in', function() {
						window.location.assign('/signin');
					});
				} else {
					generateErrModal('unable to perform operation: ' + requestObject.responseText);
				};
			};
		};
	};
};

if (document.getElementById('reset_password_submit')) {
	document.getElementById('reset_password_submit').onclick = function(e) {
		if (e.keyCode === 13) return false;
		e.preventDefault();
		var email = document.getElementById('reset_email').value;
		document.getElementById('reset_email').value = '';
		var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		makeRequestWithHeaders(requestObject, '/password/reset', 'POST', {email: email});
		BootstrapDialog.alert('if an account with that email exists, instructions are emailed and will be available soon');
	};
};

if (document.getElementById('signin_submit')) {
	windowTokenStorage('clear');
	document.getElementById('signin_submit').onclick = function(e) {
		if (e.keyCode === 13) return false;
		e.preventDefault();
		var options = {
			email: document.getElementById('signin_email').value,
			password: document.getElementById('signin_password').value
		};
		var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		makeRequestWithHeaders(requestObject, '/signin', 'POST', options);
		requestObject.onreadystatechange = function() {
			if (requestObject.readyState === 4) {
				if (requestObject.status === 200) {
					var data = JSON.parse(requestObject.responseText);
					windowTokenStorage('set', data.token);
					window.location.assign('/home');
				} else {
					generateErrModal('unable to perform operation: ' + requestObject.responseText);
				};
			};
		};
	};
};

if (document.getElementById('resetting_password')) {
	document.getElementById('resetting_password').onclick = function(e) {
		if (e.keyCode === 13) return false;
		var uid = document.getElementById('uid').getAttribute('value');
		var password = document.getElementById("reset_password").value;
		var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		var url = '/password/reset/' + uid;
		makeRequestWithHeaders(requestObject, url, 'POST', {password: password});
		requestObject.onreadystatechange = function() {
			if (requestObject.readyState === 4) {
				if (requestObject.status === 200) {
					BootstrapDialog.alert('password is reset, please sign in to continue', function() {
						window.location.assign('/signin');
					});
				} else {
					generateErrModal('unable to perform operation: ' + requestObject.responseText);
				};
			};
		};
	};
};

/*

	APP LAYER

*/

if (document.getElementById('home-section')) {
	getAuthenticated(function(err, user) {
		if (err) {
			doLogout();
		} else {
			var numberPosts = user.numberPosts,
				twitterToday = user.twitterToday,
				facebookToday = user.facebookToday,
				numberImpressions = user.numberImpressions,
				systemStatus = user.systemStatus,
				facebookErr = user.fbError,
				twitterErr = user.twError,
				newsItemsPending = user.newsItemsPending,
				newsItemsApproved = user.newsItemsApproved,
				greetings = user.greetings,
				weeklySummary = user.weeklySummary,
				lastTwitterError = user.lastTwitterError,
				quarantineNotice;

			var lnTwitterError = lastTwitterError.length || 0;
			var isOKException = lnTwitterError < 6 && systemStatus;

			if (systemStatus === true && facebookErr === false && twitterErr === false) {
				systemStatus = 'All systems go!';
			} else if (systemStatus === true && facebookErr === true && twitterErr === false) {
				systemStatus = 'Your Facebook account needs to be authenticated. Your re-authentication is requested in "Settings".';
			} else if (systemStatus === true && facebookErr === false && twitterErr === true) {
				if (lnTwitterError > 5) systemStatus = lastTwitterError[0];
				else systemStatus = quarantineNotice = 'Please periodically check your Facebook and Twitter by sending a post from "Marketing".';
			} else {
				if (numberPosts === 0 || numberImpressions === 0) {
					systemStatus = 'Please update your social media account configurations.';
				} else {
					var fbTokenHealth = systemStatus === true ? 'GOOD' : 'BAD';
					fbTokenHealth = 'Your Facebook Token health: ' + fbTokenHealth;
					var haveTwitterErr = twitterErr === true ? 'YES' : 'NO';
					haveTwitterErr = 'Do you have errors with Twitter? ' + haveTwitterErr;
					var haveFacebookErr = facebookErr === true ? 'YES' : 'NO';
					haveFacebookErr = 'Do you have errors with Facebook? ' + haveFacebookErr;
					systemStatus =  fbTokenHealth + '... \n' + haveTwitterErr + '... \n' + haveFacebookErr + '.';
				};
			};
			
			var message = function message(name, count) {
				var filler;
				if (name === 'impressions') {
					if (count === 0) filler = 'no one has been reached by your messages yet.';
					else filler = count + ' Impressions since you signed up.';
				} else if (name === 'posts') {
					if (count === 0) filler = 'you haven\'t posted anything yet';
					else filler = count + ' Posts since you signed up!';
				} else if (name === 'pending') {
					if (user.autobot) filler = 'auto bot is ON';
					else if (count === 0) filler = 'no items awaiting approval';
					else filler = count + ' Items are pending approval.';
				} else if (name === 'scheduled') {
					if (count === 0) filler = 'your campaign is empty';
					else if (count === 1) filler = '1 Item is scheduled for auto-post';
					else filler = count + ' Items are scheduled for auto-post';
				} else {
					filler = systemStatus;
				};
				var goodArray = ['Good job!', 'Keep it up!', 'You\'re getting there!', 'You got the hang of it!', 'Nice progress!'];
				var awesomeArray = ['Wowza!', 'Shazam!', 'Bam!', 'Wahoo!', 'Wooooaaaa!'];
				if (count > 100) {
					if (count > 1000) filler = filler + ' ' + awesomeArray[Math.floor(Math.random()*awesomeArray.length)];
					else filler = filler + ' ' + goodArray[Math.floor(Math.random()*goodArray.length)];
				};
				return filler;
			};
			newsItemsPending = user.autobot ? 'bot' : newsItemsPending;
			var impressionsText = message('impressions', numberImpressions),
				postsText = message('scheduled', newsItemsApproved + greetings),
				pendingText = message('pending', newsItemsPending),
				scheduleText = message('posts', numberPosts),
				systemText = message();
			var systemHealth = systemText === 'All systems go!' || isOKException ? 'OK!' : 'NOT OK';
			var countsArray = [numberImpressions, newsItemsApproved + greetings, newsItemsPending, numberPosts, systemHealth];
			var statusArray = [impressionsText, postsText, pendingText, scheduleText, systemText];
			var countElems = [document.getElementById('impressionCount'), document.getElementById('postCount'), document.getElementById('pendingCount'), document.getElementById('scheduledCount'), document.getElementById('systemHealth')];
			var statusElems = [document.getElementById('impressionStatus'), document.getElementById('postStatus'), document.getElementById('pendingStatus'), document.getElementById('scheduledStatus'), document.getElementById('systemStatus')];
			
			countElems.forEach(function(elem, idx) {
				elem.innerHTML = countsArray[idx];
			});

			statusElems.forEach(function(elem, idx) {
				elem.innerHTML = statusArray[idx];
			});

			if (facebookToday > 48) facebookToday = '> 48';
			document.getElementById('facebookAlloted').innerHTML = facebookToday + '/48 posts';
			var fbPT = (facebookToday/48 * 100).toFixed(2);
			if (fbPT > 100) fbPT = 100;;
			document.getElementById('facebookUsed').innerHTML = fbPT + '%';

			if (twitterToday > 48) twitterToday = '> 48';
			document.getElementById('twitterAlloted').innerHTML = twitterToday + '/48 posts';
			var twPT = (twitterToday/48 * 100).toFixed(2);
			if (twPT > 100) twPT = 100;
			document.getElementById('twitterUsed').innerHTML = twPT + '%';
			var fbData = [
				{
					value: facebookToday,
					color:"#68dff0"
				},
				{
					value : (48 - facebookToday),
					color : "#444c57"
				}
			];
			var fbChart = new Chart(document.getElementById("facebookStatus").getContext("2d")).Doughnut(fbData);
			var twData = [
				{
					value: twitterToday,
					color:"#68dff0"
				},
				{
					value : (48 - twitterToday),
					color : "#444c57"
				}
			];

			function returnFormattedDate(inputDate, withYear) {
				var _month = inputDate.getMonth() + 1;
				var _day = inputDate.getDate();
				var _year = inputDate.getYear() + 1900;
				var _formatted = _month + '/' + _day;
				if (withYear === true) {_formatted = _formatted + '/' + _year};
				return _formatted;
			};

			var fbChart = new Chart(document.getElementById("twitterStatus").getContext("2d")).Doughnut(twData);
			var dateToday = new Date();
			var formattedDateToday = returnFormattedDate(dateToday, true);
			var dateTodayEls = document.getElementsByClassName('todaysDate');
			var dateTodayHolder = [];
			for (var i = 0; i < dateTodayEls.length; i++) {
				 dateTodayHolder.push(dateTodayEls[i]);
			};

			dateTodayHolder.forEach(function(el) {
				el.innerHTML = formattedDateToday;
			});

			function returnDateMinus(offset) {
				var _today = new Date();
				return returnFormattedDate(new Date(_today.setDate(_today.getDate() - offset)));
			};

			var oneDayAgo = returnDateMinus(1);
			var twoDaysAgo = returnDateMinus(2);
			var threeDaysAgo = returnDateMinus(3);
			var fourDaysAgo = returnDateMinus(4);
			var fiveDaysAgo = returnDateMinus(5);
			var sixDaysAgo = returnDateMinus(6);

			var chartDaysHolder = [oneDayAgo, twoDaysAgo, threeDaysAgo, fourDaysAgo, fiveDaysAgo, sixDaysAgo];
			var chartDaysEl = [document.getElementById('one_day_ago'), document.getElementById('two_days_ago'), document.getElementById('three_days_ago'), document.getElementById('four_days_ago'), document.getElementById('five_days_ago'), document.getElementById('six_days_ago')];
			chartDaysEl.forEach(function(el, idx) {
				el.innerHTML = chartDaysHolder[idx];
			});

			var chartDataEls = [document.getElementById('today_data'), document.getElementById('one_day_ago_data'), document.getElementById('two_days_ago_data'), document.getElementById('three_days_ago_data'), document.getElementById('four_days_ago_data'), document.getElementById('five_days_ago_data'), document.getElementById('six_days_ago_data')];
			chartDataEls.forEach(function(el, idx) {
				var dataVal = weeklySummary[idx] || 0;
				var perCent = ((dataVal/96) * 100).toFixed(2);
				if (perCent > 100) perCent = 100;
				perCent = perCent + '%';
				dataVal = Math.floor(dataVal);
				var cssAttr = 'overflow:hidden; height:' + perCent + ';';
				el.setAttribute('style', cssAttr);
				el.setAttribute('data-original-title', dataVal);
				el.innerHTML = perCent;
			});

			document.getElementById('systemConfig').onclick = function() {
				window.location.assign('/config');
			};
			document.getElementById('pendingItems').onclick = function() {
				window.location.assign('/newsfeed');
			};
			document.getElementById('scheduledCampaigns').onclick = function() {
				window.location.assign('/marketing');
			};
		};
	});
};

if (document.getElementById('marketing_campaign')) {
	getMarketingCampaigns(function(err, campaigns) {
		if (err) doLogout();
		displayOnscreenItems('marketing', campaigns);
		fadeIn(document.getElementById('mGroup1'));
		fadeIn(document.getElementById('mGroup2'));
		fadeIn(document.getElementById('mGroup3'));
		setTimeout(function() {
			fadeIn(document.getElementById('postSelections'));
		}, 300);
	});

	function destinationHumanReadable(dest) {
		var destination;
		switch(dest) {
			case 0:
				destination = 'Facebook &amp; Twitter';
				break;

			case 1:
				destination = 'Facebook Only';
				break;

			case 2:
				destination = 'Twitter Only';
				break;

			default:
				break;
		};

		return destination;
	};
	

	document.getElementById('picker').change = function() {
		switch (this.selectedIndex) {
			/*case 0:
				document.getElementById('post_header').innerHTML = 'Post title';
				document.getElementById('auto_media').style.display = 'block';
          		document.getElementById('link_media').style.display = 'none';
          		document.getElementById('no_media').style.display = 'none';
				break;*/

			case 0:
				document.getElementById('post_header').innerHTML = 'Media link';
				document.getElementById('auto_media').style.display = 'none';
          		document.getElementById('link_media').style.display = 'block';
          		document.getElementById('no_media').style.display = 'none';
				break;

			case 1:
				document.getElementById('post_header').innerHTML = '';
				document.getElementById('auto_media').style.display = 'none';
          		document.getElementById('link_media').style.display = 'none';
          		document.getElementById('no_media').style.display = 'block';
				break;

			default:
				break;
		};
	};

	function postMediaObject(skip) {
		var selectIndex = document.getElementById('picker').selectedIndex;
		var returnObj = {};
		switch (selectIndex) {
			/*case 0:
				returnObj.inputField1 = document.getElementById('title').value;
				if (!skip) document.getElementById('title').value = '';
				returnObj.mediaType = 'auto-media';
				break;*/

			case 0:
				returnObj.inputField1 = document.getElementById('url').value;
				if (!skip) document.getElementById('url').value = '';
				returnObj.mediaType = 'link-media';
				break;

			case 1:
				returnObj.inputField1 = null;
				returnObj.mediaType = 'no-media';
				break;

			default:
				break;
		};
		returnObj.inputField2 = document.getElementById('post').value;
		returnObj.destination = document.getElementById('market_destination').selectedIndex;
		if (!skip) document.getElementById('post').value = '';
		return returnObj;
	};

	function sendSocialStatus(options, direction) {
		var url = '/api/social/' + direction;
		var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		makeRequestWithHeaders(requestObject, url, 'POST', options);
		requestObject.onreadystatechange = function() {
			if (requestObject.readyState === 4) {
				if (requestObject.status === 200) {
					BootstrapDialog.alert('Congratulations! Post sent.');
				} else {
					var responseObject = JSON.parse(requestObject.responseText);
					if ('subscription' in responseObject && responseObject['subscription'] === 'payment not valid') {
						generateErrModal('you have not subscribed or updated your subscription', function() {
							window.location.assign('/payment');
						});
					} else {
						return generateErrModal('error posting, please correct errors or contact us for assistance.\n\nMessage details:\n' + requestObject.responseText, function() {
							window.location.assign('/config');
						});
					}
				};
			};
		};
	};

	document.getElementById('submit_marketing').onclick = function(e) {
		e.preventDefault();
		updateMarketing(postMediaObject());
	};

	document.getElementById('submitFb_marketing').onclick = function(e) {
		e.preventDefault();
		sendSocialStatus(postMediaObject(true), 'fb');
	};

	document.getElementById('submitTw_marketing').onclick = function(e) {
		e.preventDefault();
		sendSocialStatus(postMediaObject(true), 'tw');
	};
};

if (document.getElementById('expertise_campaign')) {

	document.getElementById('approved_content').style.opacity = 0.0;
	document.getElementById('pending_approval').style.opacity = 0.0;
	document.getElementById('hr1').style.opacity = 0.0;
	document.getElementById('hr2').style.opacity = 0.0;
	document.getElementById('autobot').style.opacity = 0.0;

	getDomainExpertise(function(err, expertise) {
		if (err) doLogout();
		
		var kw = expertise.keyword,
			approvedItems = expertise.approved,
			pendingItems = expertise.pending;

		$('#bot-checkbox').bootstrapSwitch({
			state: expertise.autobot,
			animate: true,
			handleWidth: 60,
			onSwitchChange: function() {
				updateAutobot(this.checked);
				this.checked = !this.checked;
			}
		});

		fadeIn(document.getElementById('eGroup1'));
		fadeIn(document.getElementById('eGroup2'));
		fadeIn(document.getElementById('autobot'));

		autobotUpdateScreen(expertise.autobot);

		displayOnscreenItems('approval', approvedItems);
		displayOnscreenItems('pending', pendingItems);
		setTimeout(function() {
			if (expertise.kwEmpty) {
				fadeOut(document.getElementById('pending_heading'));
				document.getElementById('pending_heading').innerHTML = 'There were no results for your designated categories, and this may be cause by your categories being too restrictive. Please update yur categories or contact us for assistance.';
				fadeIn(document.getElementById('pending_heading'));
			}
		}, 3000);
		if (kw) {
			document.getElementById('keyword').value = kw;
		};
		
		document.getElementById('expertise_submit').onclick = function(e) {
			e.preventDefault();
			updateExpertiseSubject(document.getElementById('keyword').value, function(err) {
				if (err) doLogout();
			});
		};

		document.getElementById('preview_keyword').onclick = function(e) {
			e.preventDefault();
			if (document.getElementById('keyword').value) {
				getTopicPreview(document.getElementById('keyword').value);
			};
		};
	});
};

if (document.getElementById('config-master')) {
	getSocialConfigStatus(function(err, data) {
		if (err) doLogout();

		if (data.fbHasToken && data.fbError === true) {
			document.getElementById('authenticate_facebook').style.display = 'block';
			document.getElementById('authenticate_facebook').onclick = function(e) {
				e.preventDefault();
				alignFbToken({}, function(err) {
					if (err) {
						FB.logout(function(response) {
							generateErrModal('you will have to re-approve Facebook permissions, please re-authenticate to continue.', function() {
								window.location.assign('/config');
							});
						});
					} else {
						fbAuthSuccess();
					};
				});
			};
		};

		var was = this;
		was.fbretry = false;
		var _fbAID = data.fbAID;
		var _fNom = data.fbNom;

		function updateSocialConfigs(options, callback) {
			var requestObject = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
			makeRequestWithHeaders(requestObject, '/api/user/configs', 'PUT', options);
			requestObject.onreadystatechange = function() {
				if (requestObject.readyState === 4) {
					if (requestObject.status === 200) {
						callback(null);
					} else {
						generateErrModal('network error, please check connection. you will now be logged out.', function() {
							callback(true);
						});
					};
				};
			};
		};

		document.getElementById('exit_config').onclick = function(e) {
			e.preventDefault();
			window.location.assign('/home');
		};

		doFBLoginHandler = function(options, callback) {
		    FB.login(function(response) {
	            if (response.authResponse === 'connected') {
	                fbRequestConnected(options, function(err, result) {
	                    if (err) {return callback(err);};
	                    return callback(null);
	                });
	            } else {
	                generateErrModal('error authenticating Facebook, please check network connection. you will now be logged out.', function() {
	                	window.location.assign('/signin');
	                });
	            };
		    }, {scope: 'manage_pages,publish_pages'});      
		};

		alignFbToken = function(options, callback) {
			FB.init({
				appId      : options.fbAID || _fbAID,
				status     : true,
				xfbml      : true,
				version    : 'v2.3'
			});
			FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					options.access_token = response.authResponse.accessToken;
					fbRequestConnected(options, function(err, result) {
						if (err) {return callback(err);};
						return callback(null);
					});
				} else {
					doFBLoginHandler(options, function(err) {
						if (err) { return callback(err); };
						return callback(null);
					});	
				};
			});
		};

		fbRequestConnected = function(options, callback) {
			FB.api('/me/accounts', function(response) {
				var toMatchName = options.fbNom && options.fbNom.length >= 1 ? options.fbNom : _fNom;
				toMatchName = toMatchName.toLowerCase().trim();
				var unmatched = true;
				var holderCounts = [];
				response.data.forEach(function(fbApp) {
					holderCounts.push(true);
					var fMatchName = fbApp.name.toLowerCase().trim();
					if (fMatchName === toMatchName) {
						var fbObj = {
							id: fbApp.id,
							tok: fbApp.access_token
						};
						updateUserFbToken(fbObj, function(err, result) {
							if (err) {return callback(err);};
							return callback(null);
						});
						
						unmatched = false;
					};
					if (holderCounts.length === response.data.length) {
						if (unmatched === true) {
							generateErrModal('Facebook App Name not found. Please correct, and try again.', function() {
								callback('name err');
							});
						};
					};
				});
			});
		};

		function fbAuthSuccess() {
			BootstrapDialog.show({
				size: BootstrapDialog.SIZE_LARGE,
				type: 'type-success',
	            title: 'Success!',
	            message: 'Congratulations, you are now able to post directly and through your campaigns.',
	            buttons: [{
	            	label: 'Update Marketing Campaign',
    				cssClass: 'btn-primary btn-sm',
    				autospin: true,
    				action: function(dialogRef) {
    					dialogRef.close();
    					setTimeout(function() {window.location.assign('/marketing')}, 900);
    				}
	            }, {
	            	label: 'Update Expertise Campaign',
    				cssClass: 'btn-primary btn-sm',
    				autospin: true,
    				action: function(dialogRef) {
    					dialogRef.close();
    					setTimeout(function() {window.location.assign('/newsfeed')}, 900);
    				}
	            }, {
	            	label: 'Go to Console',
    				cssClass: 'btn-primary btn-sm',
    				autospin: true,
    				action: function(dialogRef) {
    					dialogRef.close();
    					setTimeout(function() {window.location.assign('/home')}, 900);	
    				}
	            }]
	        });
		};

		document.getElementById('submit_config').onclick = function(e) {
			e.preventDefault();
			var obj = {};
			obj.fbNom = document.getElementById('fbNom').value;
			obj.fbAID = document.getElementById('fbAID').value;
			obj.fbSec = document.getElementById('fbAS').value;
			obj.twKey = document.getElementById('twK').value;
			obj.twSec = document.getElementById('twS').value;
			obj.twToK = document.getElementById('twTK').value;
			obj.twToS = document.getElementById('twTS').value;

			document.getElementById('fbNom').value = '';
			document.getElementById('fbAID').value = '';
			document.getElementById('fbAS').value = '';
			document.getElementById('twK').value = '';
			document.getElementById('twS').value = '';
			document.getElementById('twTK').value = '';
			document.getElementById('twTS').value = '';

			function authenticateFacebook(callback) {
				alignFbToken(obj, function(err) {
            		if (err) {
            			if (err !== 'name err') { 
					        generateErrModal('unable to authenticate Facebook: ' + err, function() {
					        	window.location.assign('/config');
					        });
						}
            		} else {
            			fbAuthSuccess();
            		};
            		callback();
            	});
			};

			updateSocialConfigs(obj, function(err) {
				if (err) doLogout();
				BootstrapDialog.show({
					size: BootstrapDialog.SIZE_LARGE,
					type: 'type-success',
		            title: 'Configurations updated successfully',
		            message: 'Facebook requires one more step for authentication.\n\nWould you like to proceed now?',
		            buttons: [{
		                label: 'Yes',
		                autospin: true,
		                cssClass: 'btn-primary',
		                action: function(dialogRef) {
		                	dialogRef.enableButtons(false);
		                    dialogRef.setClosable(false);
		                    dialogRef.getModalBody().html('Attempting to authenticate Facebook.');
		                    authenticateFacebook(function() {
		                    	dialogRef.close();
		                    });
		                }
		            }, {
		            	label: 'Not now',
		                cssClass: 'btn-danger',
		                action: function(dialogRef) {
		                	dialogRef.close();
		                }
		            }]
		        });
			}); 
		};
	});
};