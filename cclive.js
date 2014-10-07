// Crittercism-Telemetry live connector Node app
// Created by Martin Stone <martin@crittercism.com>
//
// Retrieves live stats on app loads, crashes and exceptions from
// Crittercism and populates Telemetry dashboards.

// To use:
// 1. Fill in your Crittercism and Telemetry access info in ./ccconfig.js
// 2. Install dependencies by typing "npm install" in this directory
// 3. Run the app by typing "node cclive"
//
var async = require('async'),
		net = require('net'),
		schedule = require('node-schedule'),
		CrittercismClient = require('./CrittercismClient.js'),
		TelemetryClient = require('./TelemetryClient.js'),
		config = require('./ccconfig.js');

var cc = new CrittercismClient(config.Crittercism.clientID),
		telemetry = new TelemetryClient(config.Telemetry.token);

function log(message) {
	console.log('[' + (new Date).toLocaleString() + '] ' + message);
}

function getCrittercismLiveCounts(callback) {
	global.stats = {};
	var i = 0;
	log('Getting live counts for ' + Object.keys(global.apps).length + ' apps from Crittercism...');
	async.each(Object.keys(global.apps), function(app, callback) {
		cc.liveStatsTotals(app, null, function(err, data) {
			if (err) {
				log('Failed to get stats for app id ' + app);
				callback(err);
			} else {
				global.stats[app] = data;
				i++;
				callback(null);
			}
		});
	},
	function(err, results) {
		callback(err, results);
	});
}

function getCrittercismLivePeriodic(callback) {
	global.periodic = {};
	var i = 0;
	log('Getting live periodic data for ' + Object.keys(global.apps).length + ' apps from Crittercism...');
	async.each(Object.keys(global.apps), function(app, callback) {
		cc.liveStatsPeriodic(app, null, true, function(err, data) {
			if (err) {
				log('Failed to get periodic data for app id ' + app);
				callback(err);
			} else {
				global.periodic[app] = data;
				i++;
				callback(null);
			}
		});
	},
	function(err, results) {
		callback(err, results);
	});
}

function pushDataToTelemetry(callback) {
	var flows = {};

	var appLoads = {
		title: 'App Loads Today',
		bars: []
	},
	crashes = {
		title: 'Crashes Today',
		bars: []
	},
	exceptions = {
		title: 'Exceptions Today',
		bars: []
	},
	crashPercent = {
		title: 'Crash % Today',
		bars: []
	};

	Object.keys(global.apps).forEach(function(app, index) {
		appLoads.bars.push({
			color: "green",
			label: global.apps[app].appName,
			value: global.stats[app].total_app_loads
		});
		crashes.bars.push({
			color: "red",
			label: global.apps[app].appName,
			value: global.stats[app].total_errors
		});
		exceptions.bars.push({
			color: "yellow",
			label: global.apps[app].appName,
			value: global.stats[app].total_exceptions
		});
		var pct = 0;
		if (global.stats[app].total_app_loads > 0) {
			pct = Math.round((global.stats[app].total_errors / global.stats[app].total_app_loads) * 100);
		}
		crashPercent.bars.push({
			color: "blue",
			label: global.apps[app].appName,
			value: pct
		});

		var appLoadsSeries = [],
			  crashesSeries = [],
			  exceptionsSeries = [];

		global.periodic[app].periodic_data.forEach(function(point) {
			appLoadsSeries.push(point.app_loads);
			crashesSeries.push(point.app_errors);
			exceptionsSeries.push(point.app_exceptions);
		});

		var seriesFlow = {
			title: global.apps[app].appName,
			baseline: 'zero',
			start_time: global.periodic[app].periodic_data[0].time / 1000,
			renderer: 'bar',
			series: [
				{
					label: 'App Loads',
					color: 'green',
					values: appLoadsSeries
				},
				{
					label: 'Crashes',
					color: 'red',
					values: crashesSeries
				},
				{
					label: 'Exceptions',
					color: 'yellow',
					values: exceptionsSeries
				}
			]
		};
		flows['ccseries_' + app] = seriesFlow;


		i++;
	});

	flows[global.flows[global.widgets[0].id].tag] = appLoads;
	flows[global.flows[global.widgets[1].id].tag] = crashes;
	flows[global.flows[global.widgets[2].id].tag] = exceptions;
	flows[global.flows[global.widgets[3].id].tag] = crashPercent;

	telemetry.sendFlows(flows, function(err, data) {
		if (err) {
			log('Failed to send flows: ' + err.statusCode + ': ' + err.message);
			callback(err);
		} else {
			log('Sent flows to Telemetry, ' + data.updated.length + ' updated, ' + data.skipped.length + ' skipped, ' + data.errors.length + ' errors');
			callback(null);
		}
	});
}

async.series([
	function init(callback) {
		cc.init(config.Crittercism.username, config.Crittercism.password, function(err) {
			if (err) {
				log('failed to initialize: ' + err.statusCode + ': ' + err.error_description);
				callback(err);
			} else {
				log('Crittercism API client initialized');
				callback(null);
			}
		});
	},

	function listApps(callback) {
		cc.apps(function(err, data) {
			if (err) {
				log('failed to retrieve apps: ' + JSON.stringify(err, null, '  '));
				callback(err);
			} else {
				for ( app in data ) {
					delete data[app].links;
					if ( config.Crittercism.onlyShowApps ) {
						if ( config.Crittercism.onlyShowApps.indexOf(data[app].appName) < 0 ) {
							delete data[app];
						}
					}
				}
				global.apps = data;
				log('Got ' + Object.keys(global.apps).length + ' apps');
				callback(null);				
			}
		});
	},

	function getBoards(callback) {
		log('Getting boards from Telemetry...')
		telemetry.getBoards(function (err, data) {
			if (err) {
				log('Failed to get boards');
				callback(err);
			} else {
				global.boards = data;
				log('Found ' + global.boards.length + ' boards');
				callback(null, data);
			}
		});
	},

	function createLiveCountsBoard(callback) {
		global.boards.forEach(function(board) {
			if (board.name == config.Telemetry.liveCountsBoardName) {
				log('Board ' + board.name + ' already exists with ID ' + board.id);
				global.liveCountsBoard = board;
				callback(null);
			}
		});

		if ( !global.liveCountsBoard ) {
			log('Creating a new Live Counts board called ' + config.Telemetry.liveCountsBoardName);
			var params = {
				name: config.Telemetry.liveCountsBoardName,
				theme: 'dark',
				aspect_ratio: 'HDTV'
			};

			telemetry.createBoard(params, function(err,data) {
				if (err) {
					log('Failed to create board: ' + err.statusCode + ': ' + err.message);
					callback(err);
				} else {
					global.liveCountsBoard = data;
					log('Board created with id ' + global.liveCountsBoard.id);
					callback(null);
				}
			});
		}
	},

	function createLiveSeriesBoard(callback) {
		global.boards.forEach(function(board) {
			if (board.name == config.Telemetry.liveSeriesBoardName) {
				log('Board ' + board.name + ' already exists with ID ' + board.id);
				global.liveSeriesBoard = board;
				callback(null);
			}
		});

		if ( !global.liveSeriesBoard ) {
			log('Creating a new Live Series board called ' + config.Telemetry.liveSeriesBoardName);
			var params = {
				name: config.Telemetry.liveSeriesBoardName,
				theme: 'dark',
				aspect_ratio: 'HDTV'
			};

			telemetry.createBoard(params, function(err,data) {
				if (err) {
					log('Failed to create board: ' + err.statusCode + ': ' + err.message);
					callback(err);
				} else {
					global.liveSeriesBoard = data;
					log('Board created with id ' + global.liveSeriesBoard.id);
					callback(null);
				}
			});
		}
	},

	function deleteWidgets(callback) {
		telemetry.getWidgets(function(err, data) {
			if (err) {
				log('Failed to get widgets');
				callback(err);
			} else {
				async.each(data, function(widget, callback) {
					if (widget.board_id == global.liveCountsBoard.id ||
						  widget.board_id == global.liveSeriesBoard.id) {
						log('Deleting widget ' + widget.id);
						telemetry.deleteWidget(widget.id, function(err, data) {
							if (err) {
								log('Failed to delete widget ' + widget.id);
								callback(err);
							} else {
								callback(null);
							}
						});
					}
				},
				function(err, results) {
					callback(err, results);
				});
			}
		});
	},

	function createLiveCountsWidgets(callback) {
		log('Creating widgets in board ' + config.Telemetry.liveCountsBoardName);
		global.widgets = [];
		var params = [];

		var columnWidth = Math.floor(global.liveCountsBoard.columns/4);
		for ( i = 0; i < 4; i++ ) {
			var column = i * columnWidth;
				params.push({
					variant: 'barchart',
					board_id: global.liveCountsBoard.id,
					column: column,
					row: 0,
					width: columnWidth,
					height: global.liveCountsBoard.rows
				});
		}
		async.eachSeries(params, function(widget, callback) {
			telemetry.createWidget(widget, function(err, data) {
				if (err) {
					log('Failed to create widget at row ' + widget.row + ', column ' + widget.column + ': ' + err.statusCode + ' - ' + JSON.stringify(err, null, '  '));
					callback(err);
				} else {
					var widgetIndex = data.column / data.width;
					global.widgets[widgetIndex] = data;
					callback(null);
				}
			});
		},
		function(err, results) {
			callback(err, results);
		});
	},

	function getFlowsForCountWidgets(callback) {
		log('Getting flows for widgets in board ' + config.Telemetry.liveCountsBoardName);
		global.flows = {};
		async.each(global.widgets, function(widget, callback) {
			telemetry.getFlow(widget.flow_ids[0], function(err, data) {
				if (err) {
					log('Failed to get flow for widget ' + i + ': ' + err.statusCode + ': ' + err.message);
					callback(err);
				} else {
					global.flows[widget.id] = data;
					callback(null);
				}
			});
		},
		function(err, results) {
			callback(err, results);
		});
	},

	function createLiveSeriesWidgets(callback) {
		log('Creating widgets in board ' + config.Telemetry.liveSeriesBoardName);
		global.seriesWidgets = [];
		var params = [];
		var columnWidth = Math.floor(global.liveSeriesBoard.columns/config.Telemetry.liveSeriesBoardColumns);
		var numRows = Math.ceil(Object.keys(global.apps).length/config.Telemetry.liveSeriesBoardColumns)
		var rowHeight = Math.floor(global.liveSeriesBoard.rows/numRows);

		Object.keys(global.apps).forEach(function(app, index) {
			params.push({
				variant: 'graph',
				board_id: global.liveSeriesBoard.id,
				column: (index % config.Telemetry.liveSeriesBoardColumns) * columnWidth,
				row: Math.floor(index / config.Telemetry.liveSeriesBoardColumns) * rowHeight,
				width: columnWidth,
				height: rowHeight
			});			
		});

		async.eachSeries(params, function(widget, callback) {
			telemetry.createWidget(widget, function(err, data) {
				if (err) {
					log('Failed to create widget at row ' + widget.row + ', column ' + widget.column + ': ' + err.statusCode + ' - ' + JSON.stringify(err, null, '  '));
					callback(err);
				} else {
					var widgetIndex = ((data.row / rowHeight) * config.Telemetry.liveSeriesBoardColumns) + (data.column / columnWidth);
					global.seriesWidgets[widgetIndex] = data;
					callback(null);
				}
			});
		},
		function(err, results) {
			callback(err, results);
		});
	},

	function updateFlowsForSeriesWidgets(callback) {
		log('Updating flow tags in board ' + config.Telemetry.liveSeriesBoardName)
		var paramses = [];
		global.seriesWidgets.forEach(function(widget, index) {
			paramses.push({
				id: widget.flow_ids[0],
				tag: 'ccseries_' + Object.keys(global.apps)[index]
			});
		});

		async.each(paramses, function(params, callback) {
			telemetry.updateFlow(params, function(err, data) {
				if (err) {
					log('Failed to update flow ' + params.id);
					callback(err);
				} else {
					callback(null);
				}
			});
		},
		function(err, results) {
			callback(err, results);
		});
	},

	function scheduleUpdate(callback) {
		var liveStatsRule = new schedule.RecurrenceRule();
		liveStatsRule.second = [00, 30];
		var liveStatsJob = schedule.scheduleJob(liveStatsRule, function(){
			async.series([
				function getData(callback) {
					async.parallel([
						function getCounts(callback) {
							getCrittercismLiveCounts(callback);
						},
						function getPeriodic(callback) {
							getCrittercismLivePeriodic(callback);
						}
					],
					function(err, results) {
						callback(err,results);
					});
				},
				function sendData(callback) {
					pushDataToTelemetry(callback);
				}
			]);
		});
		// never call back from here means this runs forever
	}
]);