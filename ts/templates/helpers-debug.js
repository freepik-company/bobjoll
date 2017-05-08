var Handlebars = require('handlebars-template-loader/runtime');

Handlebars.registerHelper('highlight_mysql_keywords', function (element) {    
	var string = element;
	var keywords = [
		"GROUP_CONCAT",
		"DISTINCT",
		"CONCAT",
		"SELECT",
		"GROUP",
		"INNER",
		"LIMIT",
		"ORDER",
		"RIGHT",
		"WHERE",
		"COUNT",
		"MATCH",
		"DESC",
		"FROM",
		"LEFT",
		"LIKE",
		"JOIN",
		"AND",
		"ASC",
		"SUM",
		"NOT",
		"IF",
		"ON",
		"BY",
		"AT",
		"IN",
		"AS"
	];

	for (var i = 0; i < keywords.length; i++) {
		var re = new RegExp('\\b' + keywords[i] + '\\b', 'gi');

		string = string.replace(re, '<b>' + keywords[i] + '</b>'); 
	}

	return string;
});

Handlebars.registerHelper('ifObject', function(item, options) {
	if(typeof item === "object") {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

Handlebars.registerHelper("get_obj_length", function(json) {
    return Object.keys(json).length;
});

Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

    var operators, result;
    
    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }
    
    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }
    
    operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    };
    
    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }
    
    result = operators[operator](lvalue, rvalue);
    
    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});