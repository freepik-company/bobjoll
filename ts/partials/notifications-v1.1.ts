import * as Settings from 'Settings';

const extend = require('BobjollPath/library/extend');

export interface Position {
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
    timeout?: number;
    template?: Function;
    position?: keyof Position;
}

export interface InsertSettings extends Settings {
    id?: string;
    class?: string;
    html: string;
    target?: string;
}

export default class Notifications {
    public settings: DefaultSettings;
    private wrapper: HTMLElement;
    private active: any;
    private storage: Storage;

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
        this.storage = window.localStorage;
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
        let position: InsertPosition = options.position.match(/top/) ? 'beforeend' : 'afterbegin';
        let target = options.target ? document.querySelector(options.target) : null;
        let notification = document.getElementById(options.id);

        if (!notification || !options.id) {
            if (!options.id && options.recurrent) {
                options.recurrent = false;

                console.warn('You have to define a fixed ID for this notification in order for recurrent to work properly.');
            }

            if (options.recurrent && this.storage.getItem(options.id)) return;

            options.id = options.id || `notifications_${new Date().getTime()}`;

            if (target) {
                anchor = document.body;
                position = 'beforeend';
            }

            anchor.insertAdjacentHTML(position, options.template(options));

            if (target) {            
                notification = document.getElementById(options.id);

                if (notification) {
                    const notificationBounding = notification.getBoundingClientRect();
                    const notificationTriangle = (<HTMLElement>notification.querySelector('.notification__triangle'));
                    const targetBounding = target.getBoundingClientRect();

                    notification.classList.add('notification--absolute');

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

    public hide(id: string) {
        const notification = document.getElementById(id);

        if (notification) {
            const recurrent = notification.dataset.recurrent;

            notification.classList.add('animation--fade-out');

            if (recurrent) {
                const userDisable = (<HTMLInputElement>notification.querySelector('.notification__disable input'));

                if (userDisable && userDisable.checked) {
                    this.storage.setItem(id, 'false');
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