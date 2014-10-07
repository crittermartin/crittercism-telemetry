var https = require('https');

TelemetryClient.telemetryHost = 'api.telemetryapp.com';

TelemetryClient.telemetryURLs = {
	account: '/account',
	boards: '/boards',
	channels: '/channels',
	data: '/data',
	flows: '/flows',
	widgets: '/widgets'
}

var token;

function TelemetryClient(token) {
	this.token = token;
}

function checkAndReturn(err, data, callback) {
	if (err) {
		callback(err);
		return;
	} else {
		callback(null, data);
	}
}

////////////////////////////////
//
// Accounts
//
TelemetryClient.prototype.getAccount = function getAccount(callback) {
	this.clientGet(TelemetryClient.telemetryURLs.account, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

////////////////////////////////
//
// Boards
//
TelemetryClient.prototype.getBoards = function getBoards(callback) {
	this.clientGet(TelemetryClient.telemetryURLs.boards, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.getBoard = function getBoard(id, callback) {
	this.clientGet(TelemetryClient.telemetryURLs.boards + '/' + id, function (err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.createBoard = function createBoard(params, callback) {
	this.clientPost(TelemetryClient.telemetryURLs.boards, params, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.updateBoard = function updateBoard(params, callback) {
	var id = params.id;
	this.clientPatch(TelemetryClient.telemetryURLs.boards + '/' + id, params, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.deleteBoard = function deleteBoard(id, callback) {
	this.clientDelete(TelemetryClient.telemetryURLs.boards + '/' + id, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

////////////////////////////////
//
// Data
//
TelemetryClient.prototype.sendFlows = function sendFlows(flows, callback) {
	this.clientPost(TelemetryClient.telemetryURLs.data, flows, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.sendFlow = function sendFlow(flowID, flowData, callback) {
	var flows = {};
	flows[flowID] = flowData;
	this.sendFlows(flows, callback);
}

////////////////////////////////
//
// Flows
//
TelemetryClient.prototype.getFlows = function getFlows(callback) {
	this.clientGet(TelemetryClient.telemetryURLs.flows, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.getFlow = function getFlow(id, callback) {
	this.clientGet(TelemetryClient.telemetryURLs.flows + '/' + id, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.createFlow = function createFlow(params, callback) {
	this.clientPost(TelemetryClient.telemetryURLs.flows, params, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.updateFlow = function updateFlow(params, callback) {
	var id = params.id;
	this.clientPatch(TelemetryClient.telemetryURLs.flows + '/' + id, params, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.deleteFlow = function deleteFlow(id, callback) {
	this.clientDelete(TelemetryClient.telemetryURLs.flows + '/' + id, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}


////////////////////////////////
//
// Widgets
//
TelemetryClient.prototype.getWidgets = function getWidgets(callback) {
	this.clientGet(TelemetryClient.telemetryURLs.widgets, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.getWidget = function getWidget(id, callback) {
	this.clientGet(TelemetryClient.telemetryURLs.widgets + '/' + id, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.createWidget = function createWidget(params, callback) {
	this.clientPost(TelemetryClient.telemetryURLs.widgets, params, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.updateWidget = function updateWidget(params, callback) {
	var id = params.id;
	this.clientPatch(TelemetryClient.telemetryURLs.widgets + '/' + id, params, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.deleteWidget = function deleteWidget(id, callback) {
	this.clientDelete(TelemetryClient.telemetryURLs.widgets + '/' + id, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}


////////////////////////////////
//
// Channels
//
TelemetryClient.prototype.getChannels = function getChannels(callback) {
	this.clientGet(TelemetryClient.telemetryURLs.channels, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.getChannel = function getChannel(id, callback) {
	this.clientGet(TelemetryClient.telemetryURLs.channels + '/' + id, function (err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.createChannel = function createChannel(params, callback) {
	this.clientPost(TelemetryClient.telemetryURLs.channels, params, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.updateChannel = function updateChannel(params, callback) {
	var id = params.id;
	this.clientPatch(TelemetryClient.telemetryURLs.channels + '/' + id, params, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.deleteChannel = function deleteChannel(id, callback) {
	this.clientDelete(TelemetryClient.telemetryURLs.channels + '/' + id, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.sendFlowsForChannel = function sendFlowsForChannel(tag, flows, callback) {
	this.clientPost(TelemetryClient.telemetryURLs.channels + '/' + tag + '/data', flows, function(err, data) {
		checkAndReturn(err, data, callback);
	});
}

TelemetryClient.prototype.sendFlowForChannel = function sendFlowForChannel(tag, flowID, flowData, callback) {
	var flows = {};
	flows[flowID] = flowData;
	this.sendFlowsForChannel(tag, flows, callback);
}

////////////////////////////////
//
// HTTPS client functions
//
TelemetryClient.prototype.clientGet = function clientGet(url, callback) {
	this.clientRequest('GET', url, null, callback);
}

TelemetryClient.prototype.clientDelete = function clientDelete(url, callback) {
	this.clientRequest('DELETE', url, null, callback);
}

TelemetryClient.prototype.clientPost = function clientPost(url, params, callback) {
	this.clientRequest('POST', url, params, callback);
}

TelemetryClient.prototype.clientPatch = function clientPatch(url, params, callback) {
	this.clientRequest('PATCH', url, params, callback);
}

TelemetryClient.prototype.clientRequest = function clientRequest(method, url, params, callback) {

	var options = {
		hostname: TelemetryClient.telemetryHost,
		method: method,
		path: url,
		headers: {
			'Authorization': 'Basic ' + new Buffer(this.token + ':' + ' ').toString('base64')
		}
	};

	var req = https.request(options, function(res) {
		var buffer = '';
		var failed = false;

		if ( res.statusCode < 200 || res.statusCode > 204 ) failed = true;

	  res.setEncoding('utf8');
	  res.on('data', function (chunk) {
	    buffer += chunk;
		}).on('end', function() {
			if (failed) {
				callback(res);
				return;
			}
			var o;
			try {
				o = JSON.parse(buffer);
			} catch(e) {
				o = e.message;
			}

			callback(null, o);
		});
	});
	if (params != null) {
		req.write(JSON.stringify(params));
	}
	req.end();
}


module.exports = TelemetryClient;