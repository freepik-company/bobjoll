(function (root) {
    'use strict';

    function NumberAbbreviate() {
        var units
        if (!(this instanceof NumberAbbreviate)) {
            // function usage: abbrev(n, decPlaces, units)
            var n = arguments[0]
            var decPlaces = arguments[1]
            var floor = !!arguments[2]
            units = arguments[3]
            var ab = new NumberAbbreviate(units)
            return ab.abbreviate(n, decPlaces, floor)
        }
        // class usage: new NumberAbbreviate(units)
        units = arguments[0]
        this.units = units == null ? ['k', 'm', 'b', 't'] : units
    }

    NumberAbbreviate.prototype._abbreviate = function (number, decPlaces, floor) {
        decPlaces = Math.pow(10, decPlaces)

        for (var i = this.units.length - 1; i >= 0; i--) {

            var size = Math.pow(10, (i + 1) * 3)

            if (size <= number) {
                number = Math[floor ? 'floor' : 'round'](number * decPlaces / size) / decPlaces

                if ((number === 1000) && (i < this.units.length - 1)) {
                    number = 1
                    i++
                }

                number += this.units[i]

                break
            }
        }

        return number
    }

    NumberAbbreviate.prototype.abbreviate = function (number, decPlaces, floor) {
        var isNegative = number < 0
        var abbreviatedNumber = this._abbreviate(Math.abs(number), decPlaces || 0, floor)

        return isNegative ? '-' + abbreviatedNumber : abbreviatedNumber;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = NumberAbbreviate
    } else {
        root.NumberAbbreviate = NumberAbbreviate
    }

})(this);
