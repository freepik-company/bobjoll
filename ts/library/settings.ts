var Settings = require('ProjectPath/settings.json');

Object.keys(Settings.breakpoints).map(function(key, index) {
	Settings.breakpoints[key] = parseFloat(Settings.breakpoints[key]);
});

export = Settings;