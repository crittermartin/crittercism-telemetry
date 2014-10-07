crittercism-telemetry
=====================

Crittercism (http://crittercism.com) connector to Telemetry (http://telemetryapp.com)

Retrieves live stats on app loads, crashes and exceptions from
Crittercism and populates Telemetry dashboards.

To use:

1. Fill in your Crittercism and Telemetry access info in ./ccconfig.js
2. Install dependencies by typing "npm install" in this directory
3. Run the app by typing "node cclive"

The app will create boards and widgets in Telemetry, then poll Crittercism every 30 seconds for live data on app loads, crashes and exceptions for all of your apps and populate it in Telemetry.  Take a look at ./ccconfig.js for some additional configuration options.

