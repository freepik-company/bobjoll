var extend = function ( defaults, options ) {
    var extended = {};
    var prop;
    for (prop in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
            extended[prop] = defaults[prop];
        }
    }
    for (prop in options) {
        if (Object.prototype.hasOwnProperty.call(options, prop)) {
            extended[prop] = options[prop];
        }
    }
    return extended;
};

(function(){
    if (typeof define === 'function' && define.amd)
        define('extend', function () { return extend; });
    else if (typeof module !== 'undefined' && module.exports)
        module.exports = extend;
    else
        window.extend = extend;
})();