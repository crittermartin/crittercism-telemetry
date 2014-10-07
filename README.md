Crittercism-Telemetry Connector
=====================

This is a Node.js app that retrieves live stats on app loads, crashes and exceptions from Crittercism and displays them in Telemetry dashboards.

Requirements:

1. A Crittercism account with a REST API access token - http://crittercism.com
2. A Telemetry account with room to create 2 additional dashboards - http://telemetryapp.com
3. Node.js and npm - http://nodejs.org

To use:

1. Fill in your Crittercism and Telemetry access info in ./ccconfig.js
2. Install dependencies by typing "npm install" in this directory
3. Run the app by typing "node cclive"

The app will create boards and widgets in Telemetry, then poll Crittercism every 30 seconds for live data on app loads, crashes and exceptions for all of your apps and populate it in Telemetry.  Take a look at ./ccconfig.js for some additional configuration options.

