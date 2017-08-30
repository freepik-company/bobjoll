import * as Settings from 'Settings';
import {localStorage as storage} from 'BobjollPath/library/storage';

declare module "BobjollPath/library/storage" {
    interface ClientStorage {
        get(namespace: 'notification-visibility', key: string): boolean;
        set(namespace: 'notification-visibility', key: string, value: boolean): void;

        get(namespace: 'notification-count', key: string): number;
        set(namespace: 'notification-count', key: string, value: boolean): void;
    }
}

const STORAGE_VISIBILITY_NS = 'notification-visibility';
const STORAGE_COUNT_NS = 'notification-count';
const extend = require('BobjollPath/library/extend');

export interface Position {
    'static': string;
    'bottom-center': HTMLElement;
    'bottom-left': HTMLElement;
    'bottom-right': HTMLElement;
    'center': HTMLElement;
    'top-center': HTMLElement;
    'top-left': HTMLElement;
    'top-right': HTMLElement;
};

export interface DefaultSettings {
    fixed: boolean;
    recurrent: boolean;
    timeout: number;
    template: Function;
    position: keyof Position;
}

export interface Settings {
    fixed?: boolean;
    recurrent?: boolean;
    recurrentMax?: number;
    timeout?: number;
    template?: Function;
    position?: keyof Position;
}

export interface InsertSettings extends Settings {
    id?: string;
    class?: string;
    html: string;
    target?: string | Element;
    position?: keyof Position;
}

export default class Notifications {
    public settings: DefaultSettings;
    private wrapper: HTMLElement;
    private active: any;

    constructor(settings?: Settings) {
        const defaultSettings: DefaultSettings = {
            fixed: false,
            recurrent: false,
            timeout: 5000,
            template: require('BobjollPath/templates/notifications-v1.1/element.hbs'),
            position: 'bottom-left'
        }

        this.setup();
        this.active = {};
        this.settings = extend(defaultSettings, settings);
    }

    private setup() {
        let template = require('BobjollPath/templates/notifications-v1.1/wrapper.hbs');
        let wrapper = document.getElementById('notifications');

        if (!wrapper) {
            document.body.insertAdjacentHTML('beforeend', template());

            wrapper = document.getElementById('notifications');
        }
        
        if (wrapper) {
            this.wrapper = wrapper;
        }
    }

    private anchor(position: Position) {
        let name = `notifications__${position}`;
        let anchor = document.querySelector(`.${name}`);

        if (!anchor) {
            anchor = document.createElement('div');
            anchor.className = name;

            this.wrapper.insertAdjacentElement('afterbegin', anchor);
        }

        return anchor;
    }

    public insert(settings: InsertSettings) {
        let options = extend(this.settings, settings);
        let anchor: Element = this.anchor(options.position);
        let position: any = options.position.match(/top/) ? 'beforeend' : 'afterbegin';
        let target = options.target ? ('string' === typeof options.target ? document.querySelector(options.target) : options.target) : null;
        let notification = document.getElementById(options.id);
        let staticNotification = 'static' === options.position;

        if (!notification || !options.id) {
            if (!options.id && options.recurrent) {
                options.recurrent = false;

                console.warn('You have to define a fixed ID for this notification in order for recurrent to work properly.');
            }

            if (options.recurrent && storage.get(STORAGE_VISIBILITY_NS, options.id) === false) return;

            options.id = options.id || `notifications_${new Date().getTime()}`;

            if (target) {
                anchor = staticNotification ? target : document.body;
                position = staticNotification ? 'afterend' : 'beforeend';
            }

            if (staticNotification) {
                options.class += ' notification--static';
            }

            anchor.insertAdjacentHTML(position, options.template(options));

            if (target) {            
                notification = document.getElementById(options.id);

                if (notification && 'static' !== options.position) {
                    const notificationBounding = notification.getBoundingClientRect();
                    const notificationTriangle = (<HTMLElement>notification.querySelector('.notification__triangle'));
                    const targetBounding = target.getBoundingClientRect();

                    notification.classList.add('notification--absolute');
                    
                    if (options.recurrentMax) {
                        notification.dataset.recurrentMax = options.recurrentMax;
                    }

                    if (options.position.match(/top/)) {
                        notification.style.bottom = `${(window.innerHeight - targetBounding.bottom - document.body.scrollTop) + targetBounding.height + parseFloat(Settings['small-spacing'])}px`;

                        if (notificationTriangle) {
                            notificationTriangle.style.top = '100%';
                            notificationTriangle.style.left = '50%';
                            notificationTriangle.style.transform = 'translateX(-50%)';
                        }
                    }

                    if (options.position.match(/bottom/)) {
                        notification.style.top = `${targetBounding.top + targetBounding.height + document.body.scrollTop + parseFloat(Settings['small-spacing'])}px`;

                        if (notificationTriangle) {
                            notificationTriangle.style.bottom = '100%';
                            notificationTriangle.style.left = '50%';
                            notificationTriangle.style.transform = 'translateX(-50%) rotate(180deg)';
                        }    
                    }

                    if (options.position.match(/left/)) {
                        notification.style.left = `${targetBounding.left}px`;

                        if (notificationTriangle) {
                            notificationTriangle.style.left = `${Settings['base-spacing']}`;
                            notificationTriangle.style.right = "";
                        } 
                    }

                    if (options.position.match(/right/)) {
                        notification.style.right = `${window.innerWidth - targetBounding.right}px`;

                        if (notificationTriangle) {
                            notificationTriangle.style.left = "";
                            notificationTriangle.style.right = `${Settings['base-spacing']}`;
                        } 
                    }

                    if (options.position.match(/-center/)) {
                        notification.style.left = `${targetBounding.left - (Math.abs(targetBounding.width - notificationBounding.width) / 2)}px`;
                    }
                }
            }

            this.show(options.id);

            if (!options.fixed) {
                this.active[options.id] = {};
                this.active[options.id].timeout = setTimeout(() => this.hide(options.id), options.timeout);
            } else {
                const notification = document.getElementById(options.id);

                if (notification) {
                    const close = notification.querySelector('.notification__close');

                    if (close) {
                        close.addEventListener('click', () => this.hide(options.id));
                    }
                }
            }
        }

        return options.id;
    }

    public hide(id: string, hideRecurrent?: boolean) {
        const notification = document.getElementById(id);

        if (notification) {
            const recurrent = notification.dataset.recurrent;

            notification.classList.add('animation--fade-out');

            if (recurrent) {
                const userDisable = (<HTMLInputElement>notification.querySelector('.notification__disable input'));
                const recurrentMax = notification.dataset.recurrentMax;

                if (userDisable && userDisable.checked || hideRecurrent) {
                    storage.set(STORAGE_VISIBILITY_NS, id, false);
                } else if (recurrentMax) {
                    let count: number = storage.get(STORAGE_COUNT_NS, `${id}_count`);                    

                    if (count) {
                        count++;          
                    }

                    storage.set(STORAGE_COUNT_NS, `${id}_count`, count ? count : 1);

                    if (count && count >= parseFloat(recurrentMax)) {
                        storage.remove(STORAGE_COUNT_NS, `${id}_count`);
                        storage.set(STORAGE_VISIBILITY_NS, id, false);
                    }
                }
            }

            if (this.active[id]) {
                clearTimeout(this.active[id].timeout);
                delete this.active[id];
            }            

            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, parseFloat(Settings['base-duration']));
        }
    }

    public show(id: string) {
        const notification = document.getElementById(id);

        if (notification) {
            notification.classList.add('animation--fade-in');
        }
    }
}
