// Crittercism-Telemetry connector configuration
// Please fill in the values appropriate to your installation below:
//
var config = {};

config.Crittercism = {};
config.Telemetry = {};

// Fill in your Crittercism details below.
// Client ID is your API access token provided by Crittercism Support.
config.Crittercism.clientID = 'YOUR_TOKEN';
config.Crittercism.username = 'YOUR_LOGIN';
config.Crittercism.password = 'YOUR_PASSWORD';

// Fill in your Telemetry token below:
config.Telemetry.token = 'YOUR_TELEMETRY_TOKEN';

// Names for the live counts and live time series boards -
// If boards by these names already exist, all widgets in these
// boards will be deleted at startup!
config.Telemetry.liveCountsBoardName = 'Crittercism Live Counts';
config.Telemetry.liveSeriesBoardName = 'Crittercism Live Stats';

// How many columns in the layout for the live series board
config.Telemetry.liveSeriesBoardColumns = 4;

// If onlyShowApps is an array of strings, 
// only apps whose names equal those strings will be tracked
//
// Example:
// config.Crittercism.onlyShowApps = [
// 	'Point of Sale MA',
// 	'Crittercism Demo',
// 	'Distribution NA',
// 	'Warehouse Tool MC',
// 	'Storage Scan NC',
// 	'Control Center',
// 	'Shipping Tracker LL',
// 	'Ops Dashboard HC',
// 	'Storefront ML',
// 	'Design Your Day',
// 	'Inventory Tracking LC'
// ];

module.exports = config;
