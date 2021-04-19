import { q } from 'bobjoll/ts/library/gr/dom.q';

export default class Countdown {
    private static readonly outer: Function = require('BobjollTemplate/countdown-v1.0/countdown.hbs');
    private static readonly inner: Function = require('BobjollTemplate/countdown-v1.0/countdown-inner.hbs');

    private element: HTMLElement;
    private settings: CountdownSettings;
    private interval: any;

    constructor(settings: CountdownSettings) {
        this.settings = settings;

        if (this.settings.container.classList.contains('countdown')) {
            this.element = this.settings.container;
        } else {
            this.settings.container.insertAdjacentHTML('beforeend', Countdown.outer());

            this.element = q('.countdown', this.settings.container) || document.createElement('div');
        }

        this.setup();
    }

    private static normalize(number: number) {
        if (number < 10) {
            return '0' + number;
        }

        return number;
    }

    private static count(options: CountdownSettings) {
        const _distance = options.dateEnd.getTime() - new Date().getTime();
        const _second = 1000;
        const _minute = _second * 60;
        const _hour = _minute * 60;
        const _day = _hour * 24;

        let date: {
            Days?: number | string;
            Hours?: number | string;
            Mins?: number | string;
            Secs?: number | string;
        } = {};
        let days = Countdown.normalize(Math.floor(_distance / _day));

        if (days > 0) {
            date.Days = days;
        }

        date.Hours = Countdown.normalize(Math.floor((_distance % _day) / _hour));
        date.Mins = Countdown.normalize(Math.floor((_distance % _hour) / _minute));
        date.Secs = Countdown.normalize(Math.floor((_distance % _minute) / _second));

        if (_distance < 0) return;

        return date;
    }

    private static countLeft(options: CountdownSettings) {
        if (!options.dateStart || !options.total) return;

        const dateCurrent = new Date();
        const timeTotal = options.dateEnd.getTime() - options.dateStart.getTime();
        const timeLeft = options.dateEnd.getTime() - dateCurrent.getTime();
        const total = Math.round(Math.abs((timeLeft / timeTotal) * options.total))
            .toString()
            .split('');

        if (timeLeft <= 0 || !(dateCurrent >= options.dateStart && dateCurrent <= options.dateEnd)) {
            return '0000'.toString().split('');
        }

        if (total.length < options.total.toString().length) {
            const loop = options.total.toString().length - total.length;
            for (let i = 0; i < loop; i++) {
                total.unshift('0');
            }
        }

        return total;
    }

    private setup() {
        let method: Function = Countdown.count;

        if (this.settings.dateStart && this.settings.total) {
            method = Countdown.countLeft;
        }

        this.element.innerHTML = Countdown.inner({
            date: method(this.settings),
        });

        this.interval = setInterval(() => {
            const date = method(this.settings);

            let data: any = {};

            if (date) {
                data['date'] = date;
            }

            this.element.innerHTML = Countdown.inner(data);

            if (new Date().getTime() >= this.settings.dateEnd.getTime()) {
                clearInterval(this.interval);
            }
        }, 1000);
    }
}

export interface CountdownSettings {
    container: HTMLElement;
    dateStart?: Date;
    dateEnd: Date;
    total?: number;
}
