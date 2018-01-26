const extend = require('BobjollPath/library/extend');

// tslint:disable-next-line:import-name
import Notification, { Position } from 'BobjollPath/partials/notifications-v1.1';

type AlertType = 'success' | 'warning' | 'error';

export interface InsertSettings {
    fixed?: boolean;
    class: AlertType;
    html: string;
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

export default class Alert extends Notification {
    constructor(settings?: Settings) {
        const defaultSettings = {
            recurrent: false,
            fixed: false,
            timeout: 5000,
            template: require('BobjollPath/templates/alert.hbs'),
            position: 'top-right'
        };

        super(extend(defaultSettings, settings));
    }

    public new(html: string, type: AlertType, fixed = false) {
        console.log({
            fixed: fixed,
            html: html,
            class: `notification--${type}`
        });
        return super.insert({
            fixed: fixed,
            html: html,
            class: `notification--${type}`
        });
    }
}
