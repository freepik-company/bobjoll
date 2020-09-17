// tslint:disable-next-line:import-name
import Notification, { Position, Link } from 'BobjollNotifications';
import View from 'BobjollView';

const EXT = View.ext;
const extend = require('bobjoll/ts/library/extend');

type AlertType = 'info' | 'warning' | 'error';

export interface InsertSettings {
    content?: string;
    events?: {
        onload?: Function;
        click?: Function;
        close?: Function;
    };
    fixed?: boolean;
    link?: Link;
    title: string;
    type: AlertType;
}

export interface DefaultSettings {
    fixed: boolean;
    recurrent: boolean;
    timeout: number;
    template: Function;
    position: keyof Position;
}

export interface Settings {
    fixed?: boolean;
    timeout?: number;
    template?: Function;
    position?: keyof Position;
}

export default class AlertV2 extends Notification {
    constructor(settings?: Settings) {
        const defaultSettings = {
            recurrent: false,
            fixed: true,
            timeout: 5000,
            template: require(`BobjollTemplate/alert-v2.0/element.${EXT}`),
            position: 'top-right'
        };

        super(extend(defaultSettings, settings));
    }

    public new(settings: InsertSettings) {
        return super.insert({
            ...settings,
            class: `notification--alert--${settings.type}`
        });
    }
}
