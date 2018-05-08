var Settings = require('Project/settings.json');

Object.keys(Settings.breakpoints).map(function(key) {
	Settings.breakpoints[key] = parseFloat(Settings.breakpoints[key]);
});

export { Settings };
