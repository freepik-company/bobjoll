// Method matches
if (!Element.prototype.matches) {
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;            
        };
}

// Closest
if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest =
        function (s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i,
                el = this;
            do {
                i = matches.length;
                while (--i >= 0 && matches.item(i) !== el) { };
            } while ((i < 0) && (el = el.parentElement));
            return el;
        };
}

// polyfill.number.toLocaleDateString
(function () {
    'use strict';

    function toLocaleStringSupportsLocales() {
        var number = 0;
        try {
            number.toLocaleString("i");
        } catch (e) {
            return e.name === "RangeError";
        }
        return false;
    }

    if (!toLocaleStringSupportsLocales()) {
        var replaceSeparators = function (sNum, separators) {
            var sNumParts = sNum.split('.');
            if (separators && separators.thousands) {
                sNumParts[0] = sNumParts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + separators.thousands);
            }
            sNum = sNumParts.join(separators.decimal);

            return sNum;
        };

        var renderFormat = function (template, props) {
            for (var prop in props) {
                if (props[prop].indexOf('-') !== -1) {
                    props[prop] = props[prop].replace('-', '');
                    template = '-' + template;
                }
                template = template.replace("{{" + prop + "}}", props[prop]);
            }

            return template;
        };

        var mapMatch = function (map, locale) {
            var match = locale;
            var language = locale && locale.toLowerCase().match(/^\w+/);

            if (!map.hasOwnProperty(locale)) {
                if (map.hasOwnProperty(language)) {
                    match = language;
                } else {
                    match = "en";
                }
            }

            return map[match];
        };

        var dotThousCommaDec = function (sNum) {
            var separators = {
                decimal: ',',
                thousands: '.'
            };

            return replaceSeparators(sNum, separators);
        };

        var commaThousDotDec = function (sNum) {
            var separators = {
                decimal: '.',
                thousands: ','
            };

            return replaceSeparators(sNum, separators);
        };

        var spaceThousCommaDec = function (sNum) {
            var seperators = {
                decimal: ',',
                thousands: '\u00A0'
            };

            return replaceSeparators(sNum, seperators);
        };

        var apostrophThousDotDec = function (sNum) {
            var seperators = {
                decimal: '.',
                thousands: '\u0027'
            };

            return replaceSeparators(sNum, seperators);
        };

        var transformForLocale = {
            en: commaThousDotDec,
            'en-GB': commaThousDotDec,
            'en-US': commaThousDotDec,
            it: dotThousCommaDec,
            es: dotThousCommaDec,
            fr: spaceThousCommaDec,
            de: dotThousCommaDec,
            "de-DE": dotThousCommaDec,
            "de-AT": dotThousCommaDec,
            "de-CH": apostrophThousDotDec,
            "de-LI": apostrophThousDotDec,
            "de-BE": dotThousCommaDec,
            "nl": dotThousCommaDec,
            "nl-BE": dotThousCommaDec,
            "nl-NL": dotThousCommaDec,
            ro: dotThousCommaDec,
            "ro-RO": dotThousCommaDec,
            ru: spaceThousCommaDec,
            "ru-RU": spaceThousCommaDec,
            hu: spaceThousCommaDec,
            "hu-HU": spaceThousCommaDec,
            "da-DK": dotThousCommaDec,
            "nb-NO": spaceThousCommaDec
        };

        var currencyFormatMap = {
            en: "pre",
            'en-GB': "pre",
            'en-US': "pre",
            it: "post",
            fr: "post",
            de: "post",
            "de-DE": "post",
            "de-AT": "prespace",
            "de-CH": "prespace",
            "de-LI": "post",
            "de-BE": "post",
            "nl": "post",
            "nl-BE": "post",
            "nl-NL": "post",
            ro: "post",
            "ro-RO": "post",
            ru: "post",
            "ru-RU": "post",
            hu: "post",
            "hu-HU": "post",
            "da-DK": "post",
            "nb-NO": "post"
        };

        var currencySymbols = {
            "afn": "؋",
            "ars": "$",
            "awg": "ƒ",
            "aud": "$",
            "azn": "₼",
            "bsd": "$",
            "bbd": "$",
            "byr": "p.",
            "bzd": "BZ$",
            "bmd": "$",
            "bob": "Bs.",
            "bam": "KM",
            "bwp": "P",
            "bgn": "лв",
            "brl": "R$",
            "bnd": "$",
            "khr": "៛",
            "cad": "$",
            "kyd": "$",
            "clp": "$",
            "cny": "¥",
            "cop": "$",
            "crc": "₡",
            "hrk": "kn",
            "cup": "₱",
            "czk": "Kč",
            "dkk": "kr",
            "dop": "RD$",
            "xcd": "$",
            "egp": "£",
            "svc": "$",
            "eek": "kr",
            "eur": "€",
            "fkp": "£",
            "fjd": "$",
            "ghc": "¢",
            "gip": "£",
            "gtq": "Q",
            "ggp": "£",
            "gyd": "$",
            "hnl": "L",
            "hkd": "$",
            "huf": "Ft",
            "isk": "kr",
            "inr": "₹",
            "idr": "Rp",
            "irr": "﷼",
            "imp": "£",
            "ils": "₪",
            "jmd": "J$",
            "jpy": "¥",
            "jep": "£",
            "kes": "KSh",
            "kzt": "лв",
            "kpw": "₩",
            "krw": "₩",
            "kgs": "лв",
            "lak": "₭",
            "lvl": "Ls",
            "lbp": "£",
            "lrd": "$",
            "ltl": "Lt",
            "mkd": "ден",
            "myr": "RM",
            "mur": "₨",
            "mxn": "$",
            "mnt": "₮",
            "mzn": "MT",
            "nad": "$",
            "npr": "₨",
            "ang": "ƒ",
            "nzd": "$",
            "nio": "C$",
            "ngn": "₦",
            "nok": "kr",
            "omr": "﷼",
            "pkr": "₨",
            "pab": "B/.",
            "pyg": "Gs",
            "pen": "S/.",
            "php": "₱",
            "pln": "zł",
            "qar": "﷼",
            "ron": "lei",
            "rub": "₽",
            "shp": "£",
            "sar": "﷼",
            "rsd": "Дин.",
            "scr": "₨",
            "sgd": "$",
            "sbd": "$",
            "sos": "S",
            "zar": "R",
            "lkr": "₨",
            "sek": "kr",
            "chf": "CHF",
            "srd": "$",
            "syp": "£",
            "tzs": "TSh",
            "twd": "NT$",
            "thb": "฿",
            "ttd": "TT$",
            "try": "",
            "trl": "₤",
            "tvd": "$",
            "ugx": "USh",
            "uah": "₴",
            "gbp": "£",
            "usd": "$",
            "uyu": "$U",
            "uzs": "лв",
            "vef": "Bs",
            "vnd": "₫",
            "yer": "﷼",
            "zwd": "Z$"
        };

        var currencyFormats = {
            pre: "{{code}}{{num}}",
            post: "{{num}} {{code}}",
            prespace: "{{code}} {{num}}"
        };

        Number.prototype.toLocaleString = function (locale, options) {
            if (locale && locale.length < 2)
                throw new RangeError("Invalid language tag: " + locale);

            var sNum;

            if (options && (options.minimumFractionDigits || options.minimumFractionDigits === 0)) {
                sNum = this.toFixed(options.minimumFractionDigits);
            } else {
                sNum = this.toString();
            }

            sNum = mapMatch(transformForLocale, locale)(sNum, options);

            if (options && options.currency && options.style === "currency") {
                var format = currencyFormats[mapMatch(currencyFormatMap, locale)];
                var symbol = currencySymbols[options.currency.toLowerCase()];
                if (options.currencyDisplay === "code" || !symbol) {
                    sNum = renderFormat(format, {
                        num: sNum,
                        code: options.currency.toUpperCase()
                    });
                } else {
                    sNum = renderFormat(format, {
                        num: sNum,
                        code: symbol
                    });
                }
            }

            return sNum;
        };
    }

}());