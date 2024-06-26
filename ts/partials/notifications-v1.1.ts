import { Cookie } from 'bobjoll/ts/library/cookie';
import { Settings } from 'Settings';
import View from 'BobjollView';

const EXT = View.ext;
const STORAGE_VISIBILITY_NS = 'notification-visibility';
const STORAGE_COUNT_NS = 'notification-count';
const extend = require('bobjoll/ts/library/extend');

export default class Notifications {
    public settings: DefaultSettings;
    private wrapper: HTMLElement | null = null;
    public active: any;

    constructor(settings?: Settings) {
        const defaultSettings: DefaultSettings = {
            fixed: false,
            recurrent: false,
            timeout: 5000,
            template: require(`BobjollTemplate/notification-v1.1/element.${EXT}`),
            position: 'bottom-left',
            cookieExpiry: new Date(new Date().getTime() + (365 * 24 * 60 * 60 * 1000)),
        }

        this.setup();
        this.active = {};
        this.settings = extend(defaultSettings, settings);
    }

    private setup() {
        let template = require(`BobjollTemplate/notification-v1.1/wrapper.${EXT}`);
        let wrapper = document.getElementById('notifications');

        if (!wrapper) {
            document.body.insertAdjacentHTML('beforeend', View.render(template));
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

            if (this.wrapper) {
                this.wrapper.insertAdjacentElement('afterbegin', anchor);
            }
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

        if (!notification || !options.id) {
            if (!options.id && options.recurrent) {
                options.recurrent = false;

                console.warn('You have to define a fixed ID for this notification in order for recurrent to work properly.');
            }

            if (options.recurrent && (Cookie.getItem(`${STORAGE_VISIBILITY_NS}--${options.id}`) === 'false')) {
                return;
            }

            options.id = options.id || `notifications_${new Date().getTime()}`;

            if (target) {
                anchor = staticNotification ? target : document.body;
                position = staticNotification ? 'afterend' : 'beforeend';
            }

            if (staticNotification) {
                options.class += ' notification--static';
            }

            if (options.insert) {
                anchor = options.insert.element;
                position = options.insert.position;
            }

            anchor.insertAdjacentHTML(position, View.render(options.template, options));

            notification = document.getElementById(options.id);

            if (notification && options.recurrentMax) {
                notification.dataset.recurrentMax = options.recurrentMax;
            }

            if (notification && options.recurrentPrint && options.recurrentMax) {
                notification.dataset.recurrentPrint = 'true';

                let count: number = parseFloat(Cookie.getItem(`${STORAGE_COUNT_NS}--${options.id}_count`) || '0');

                count++;

                Cookie.setItem(`${STORAGE_COUNT_NS}--${options.id}_count`, count.toString(), {
                    path: '/',
                    domain: document.domain,
                    expires: options.cookieExpiry || this.settings.cookieExpiry
                });

                if (count && count >= parseFloat(options.recurrentMax)) {
                    Cookie.removeItem(`${STORAGE_COUNT_NS}--${options.id}_count`);
                    Cookie.setItem(`${STORAGE_VISIBILITY_NS}--${options.id}`, 'false', {
                        path: '/',
                        domain: document.domain,
                        expires: options.cookieExpiry || this.settings.cookieExpiry
                    });
                }
            }

            if (notification && options.cookieExpiry) {
                notification.dataset.cookieExpiry = options.cookieExpiry.getTime();
            }

            if (target) {
                if (notification && 'static' !== options.position) {
                    const notificationBounding = notification.getBoundingClientRect();
                    const notificationTriangle = (<HTMLElement>notification.querySelector('.notification__triangle'));
                    const targetBounding = target.getBoundingClientRect();
                    const scrollPosition = this.getScrollPosition();

                    notification.classList.add('notification--absolute');

                    if (options.position.match(/top/)) {
                        notification.style.bottom = `${(window.innerHeight - targetBounding.bottom - scrollPosition) + targetBounding.height + parseFloat(Settings['small-spacing'])}px`;

                        if (notificationTriangle) {
                            notificationTriangle.style.top = '100%';
                            notificationTriangle.style.left = '50%';
                            notificationTriangle.style.transform = 'translateX(-50%)';
                        }
                    }

                    if (options.position.match(/bottom/)) {
                        notification.style.top = `${targetBounding.top + targetBounding.height + scrollPosition + parseFloat(Settings['small-spacing'])}px`;

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

            if (options.events && options.events.onload) {
                options.events.onload();
            }

            if (!options.fixed) {
                this.active[options.id] = {};
                this.active[options.id].timeout = setTimeout(() => this.hide(options.id), options.timeout);
            } else {
                const notification = document.getElementById(options.id);

                if (notification) {
                    const buttonLink = notification.querySelector('a.link-action');
                    const close = notification.querySelector('.notification__close');

                    if (buttonLink && options.events && options.events.click) {
                        buttonLink.addEventListener('click', () => {
                            options.events.click();
                        });
                    }

                    if (close) {
                        close.addEventListener('click', () => {
                            if (options.events && options.events.close) {
                                options.events.close();
                            }
                            this.hide(options.id);
                        });                 
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
                const recurrentPrint = notification.dataset.recurrenPrint;
                const cookieExpiry = notification.dataset.cookieExpiry;
                const cookieExpiryDate = new Date(parseFloat(cookieExpiry || '0'));

                if (userDisable && userDisable.checked || hideRecurrent) {
                    Cookie.setItem(`${STORAGE_VISIBILITY_NS}--${id}`, 'false', {
                        path: '/',
                        domain: document.domain,
                        expires: cookieExpiry ? cookieExpiryDate : this.settings.cookieExpiry
                    });
                } else if (recurrentMax) {
                    let count: number = parseFloat(Cookie.getItem(`${STORAGE_COUNT_NS}--${id}_count`) || '0');

                    if (!recurrentPrint && 'undefined' !== typeof count) {
                        count++;
                    }

                    Cookie.setItem(`${STORAGE_COUNT_NS}--${id}_count`, count.toString(), {
                        path: '/',
                        domain: document.domain,
                        expires: cookieExpiry ? cookieExpiryDate : this.settings.cookieExpiry
                    });

                    if (count && count >= parseFloat(recurrentMax)) {
                        Cookie.removeItem(`${STORAGE_COUNT_NS}--${id}_count`);
                        Cookie.setItem(`${STORAGE_VISIBILITY_NS}--${id}`, 'false', {
                            path: '/',
                            domain: document.domain,
                            expires: cookieExpiry ? cookieExpiryDate : this.settings.cookieExpiry
                        });
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
            notification.classList.add('notification--show');
        }
    }

    public getSettings(id: string) {
        const cookieItemCount = Cookie.getItem(`${STORAGE_COUNT_NS}--${id}_count`);
        const cookieItemVisibility = Cookie.getItem(`${STORAGE_VISIBILITY_NS}--${id}`);
        const itemCount = cookieItemCount ? parseFloat(cookieItemCount) : undefined;
        const itemVisibility = cookieItemVisibility ? true : false;

        let item: {
            count?: number;
            visibility?: boolean;
        } = {};

        if ('undefined' !== typeof itemCount) {
            item.count = itemCount;
        }

        if ('undefined' !== typeof itemVisibility) {
            item.visibility = itemVisibility;
        }

        return item;
    }

    getScrollPosition(): number {
        // return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        return window.pageYOffset || document.body.scrollTop;
    }
}


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
    cookieExpiry: Date;
}

export interface Settings {
    fixed?: boolean;
    recurrent?: boolean;
    recurrentMax?: number;
    recurrentPrint?: boolean;
    timeout?: number;
    template?: Function;
    position?: keyof Position;
    cookieExpiry?: Date;
}

export interface Link {
    arrow?: boolean;
    clickAndClose?: boolean;
    customClass?: string;
    extraAttr?: string;
    target: string;
    text: string;
    url: string;
}

export interface InsertSettings extends Settings {
    id?: string;
    class?: string;
    html?: string;
    target?: string | Element;
    insert?: {
        element: Element;
        position: 'beforeend' | 'beforebegin' | 'afterend' | 'afterbegin';
    };
    position?: keyof Position;
    cookieExpiry?: Date;
    type?: string;
    title?: string;
    content?: string;
    link?: Link;
    events?: {
        onload?: Function;
        click?: Function;
        close?: Function;
    };
}