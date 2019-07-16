import { Cookie } from 'bobjoll/ts/library/cookie';
import { KEvent, KEventTarget } from 'bobjoll/ts/library/event';
import { modal, Modal, ModalPrintSettings } from 'BobjollModal';
import { q, ww } from 'bobjoll/ts/library/dom';
import { qq } from 'bobjoll/ts/library/gr/dom.q';
import { Settings } from 'bobjoll/ts/library/settings';
import Notification from 'BobjollNotifications';

export class Notify extends KEventTarget {
    private static readonly cookieNamespace = 'notify';
    private static readonly bodyPaddingBottom = window.getComputedStyle(document.body).getPropertyValue('padding-bottom');
    private static readonly methods: NotifyMethods = {
        banner: new Notification({
            fixed: true,
            recurrent: true,
        }),
        popup: modal,
    }

    private static User: NotifyUser;
    private static History: NotifyHistory;
    private static active: string | null;
    private static instance: Notify;
    private static containerBottom: HTMLElement;
    private static containerTop: HTMLElement;
    private static queue: (DialogBannerSettings | DialogPopupSettings | DialogNotificationSettings | DialogCustomSettings)[] = [];

    constructor(options: NotifyOptions) {
        if (!Notify.instance) {
            super();
            Notify.User = options.User;
            Notify.History = options.History;
            Notify.instance = this;
            Notify.setup();
        }

        return Notify.instance;
    }

    private static setup() {
        Notify.addBaseElements();
        Notify.addEventListeners();
    }

    private static preload(settings: DialogBannerSettings | DialogPopupSettings | DialogNotificationSettings) {
        const images = [...(settings.preloadAdditional || [])];
        const dom = document.createElement('div');

        dom.innerHTML = settings.html + settings.getPathValue('globalVariables.containerHtml');

        (qq('img', dom) as HTMLImageElement[]).forEach(img => images.push(img.src));

        return new Promise((resolve, reject) => {
            let completeCounter = 0;
            let total = images.length;

            function completeCallback() {
                completeCounter++;
                if (completeCounter === total) resolve();
            }

            images.forEach(src => {
                const image = new Image();
                image.src = src;
                image.onabort = image.onerror = image.onload = completeCallback;
                if (image.complete) completeCallback();
            });
        });
    }

    private static preloadDependencies(dependencies: DependenciesObject[]) {
        return new Promise((resolve, reject) => {
            let completed = 0;
            let dependencyIntervalCounter: { [id: string]: number; } = {};
            let dependencyIntervals: { [id: string]: any; } = {};

            function completeCallback() {
                completed++;
                if (completed === dependencies.length) resolve();
            }

            dependencies.forEach(dependency => {
                if (!document.getElementById(dependency.id)) {
                    (function(d, s, id) {
                        var js, fjs = d.getElementsByTagName(s)[0];
                        if (d.getElementById(id)) return;
                        js = (d.createElement(s) as HTMLScriptElement); 
                        js.id = id;
                        js.src = dependency.url;
                        if (fjs.parentNode) fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', dependency.id));

                    dependencyIntervalCounter[dependency.id] = 0;
                    dependencyIntervals[dependency.id] = setInterval(function() {
                        if (ww[dependency.variable]) {
                            completeCallback();
                        }

                        if (ww[dependency.variable] || 100 <= dependencyIntervalCounter[dependency.id]) { // 10 seconds
                            clearInterval(dependencyIntervals[dependency.id]);
                            delete dependencyIntervals[dependency.id];
                            delete dependencyIntervalCounter[dependency.id];
                            reject(`Error: Could't load ${dependency.variable}.`);
                        }

                        dependencyIntervalCounter[dependency.id]++;
                    }, 100);
                }
            });
        });
    }

    private static addBaseElements() {
        if (!q('.notify-wrapper--top')) {
            Notify.containerTop = document.createElement('div');
            Notify.containerTop.classList.add('notify-wrapper', 'notify-wrapper--top');
            document.body.insertAdjacentElement('afterbegin', Notify.containerTop);
        }

        if (!q('.notify-wrapper--bottom')) {
            Notify.containerBottom = document.createElement('div');
            Notify.containerBottom.classList.add('notify-wrapper', 'notify-wrapper--bottom');
            document.body.insertAdjacentElement('beforeend', Notify.containerBottom);
        }
    }

    private static addEventListeners() {
        Notify.instance.addEventListener('show', () => Notify.resize());
        window.addEventListener('resize', () => Notify.resize());
    }

    private static pushQueue(settings: DialogBannerSettings | DialogPopupSettings | DialogNotificationSettings | DialogCustomSettings) {
        Notify.queue.push(settings);
    }

    private static printMethodBanner(settings: DialogBannerSettings) {
        Notify.containerTop.innerHTML = '';
        Notify.containerBottom.innerHTML = '';

        Notify.methods.banner.insert({
            id: settings.id,
            class: `notify notify--banner notification--static notification--no-shadow notification--no-border notification--hide-disable mg-none-i ${settings.class || ''}`,
            html: settings.html,
            insert: {
                element: 'top' === settings.position ? Notify.containerTop : Notify.containerBottom,
                position: 'beforeend'
            }
        });

        Notify.printMethodDone(settings);
    }

    private static printMethodPopup(settings: DialogPopupSettings) {
        let options: ModalPrintSettings = {
            name: settings.id,
            html: settings.html,
        };

        if (settings.globalVariables) {
            options = { ...options, ...settings.globalVariables }
        }

        Notify.methods.popup.add(options);

        setTimeout(() => Notify.methods.popup.show(`modal-${settings.id}`), 50);

        Notify.printMethodDone(settings);
    }

    private static printMethodCustom(settings: DialogCustomSettings) {
        const expires = settings.schedule && settings.schedule.dateExpire ? 
            settings.schedule.dateExpire : (
                settings.expires ? 
                    settings.expires(new Date()) : 
                    new Date(new Date().getTime() + (1 * 60 * 60 * 1000))
            );

        settings.callback();
        settings.closeCallback(() => Notify.printMethodClose(settings, expires));
    }

    private static printMethodNotification(settings: DialogNotificationSettings) {
        Notify.containerTop.innerHTML = '';
        Notify.containerBottom.innerHTML = '';

        Notify.methods.banner.insert({
            id: settings.id,
            class: `notify notify--banner notification--hide-disable ${settings.class || ''}`,
            html: settings.html,
            position: settings.position
        });

        Notify.printMethodDone(settings);
    }

    private static printMethodClose(settings: DialogBannerSettings | DialogPopupSettings | DialogCustomSettings | DialogNotificationSettings, expires: Date) {
        Notify.active = null;
        Notify.instance.dispatchEvent(new KEventHide(settings));

        Notify.instance.hide(settings.id);

        if (settings.type.match(/popup/)) {
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
        }

        setTimeout(Notify.resize, 50);
    }

    private static printMethodDone(settings: DialogBannerSettings | DialogPopupSettings | DialogNotificationSettings) {
        const notifyElement = document.getElementById(settings.id) || document.getElementById(`modal-${settings.id}`);
        const expires = settings.schedule && settings.schedule.dateExpire ? 
            settings.schedule.dateExpire : (
                settings.expires ? 
                    settings.expires(new Date()) : 
                    new Date(new Date().getTime() + (1 * 60 * 60 * 1000))
            );

        Notify.active = settings.id;
        Notify.instance.dispatchEvent(new KEventShow(settings));

        if (notifyElement) {
            if (settings.type.match(/notification|banner/)) {
                const bannerClose = q('.notification__close', notifyElement);

                if (bannerClose) {
                    bannerClose.addEventListener('click', () => Notify.printMethodClose(settings, expires));
                }
            }

            if (settings.type.match(/popup/)) {
                notifyElement.classList.add(settings.class || '');

                notifyElement.addEventListener('hide', () => Notify.printMethodClose(settings, expires))
            }

            if (settings.count) {
                const count = parseFloat(Cookie.getItem(`${Notify.cookieNamespace}--${settings.id}--count`) || '1');

                Cookie.setItem(`${Notify.cookieNamespace}--${settings.id}--count`, (count + 1).toString(), {
                    expires: expires
                });
            }
        }

        if (settings.callback) {
            settings.callback(notifyElement, settings);
        }
    }

    private static resize() {
        const height = qq('.notify', Notify.containerBottom).reduce((acc: number, element) => {
            acc += element.clientHeight;

            return acc;
        }, 0);

        document.body.style.paddingBottom = `${parseFloat(Notify.bodyPaddingBottom || '0') + (height || 0)}px`;
    }

    public static checkDebugEnviroment() {
        return 'debug' === (Cookie.getItem('notify') || '') ? true : false;
    }

    public addEventListener(t: 'show', listener: (ev: KEvent) => any, useCapture?: boolean): void;
    public addEventListener(t: 'hide', listener: (ev: KEvent) => any, useCapture?: boolean): void;
    public addEventListener(t: string, listener: (ev: KEvent) => any, useCapture: boolean = true): void {
        super.addEventListener(t, listener, useCapture);
    }

    public addBanner(settings: DialogBannerOptions) {
        Notify.pushQueue({ showMobile: true, ...settings, type: 'banner' });
    }

    public addNotification(settings: DialogNotificationOptions) {
        Notify.pushQueue({ showMobile: true, ...settings, type: 'notification' });
    }

    public addPopup(settings: DialogPopupOptions) {
        Notify.pushQueue({ showMobile: true, ...settings, type: 'popup' });
    }

    public addCustom(settings: DialogCustomOptions) {
        Notify.pushQueue({ showMobile: true, ...settings, type: 'custom' });
    }

    public async printQueue() {
        if (Notify.active) return;

        const date = new Date();
        const isDebugEnviroment = Notify.checkDebugEnviroment();
        const queue = Notify.queue
            .sort((a, b) => a.priority - b.priority)
            .filter(dialog => {
                if (!Cookie.getItem(`${Notify.cookieNamespace}--${dialog.id}`)) {
                    const booleanArr: {
                        name: string;
                        show: boolean;
                    }[] = [];
                    const debugIgnore = dialog.schedule ? (dialog.schedule.dateIgnoreOnDebug ? isDebugEnviroment : false) : false;
    
                    if ('undefined' !== typeof dialog.showPremiumFlaticon) {
                        booleanArr.push({
                            name: 'dialog.showPremiumFlaticon',
                            show: Notify.User.isPremiumFlaticon() ? dialog.showPremiumFlaticon : !dialog.showPremiumFlaticon,
                        });
                    }
                    
                    if ('undefined' !== typeof dialog.showPremiumFreepik) {
                        booleanArr.push({
                            name: 'dialog.showPremiumFreepik',
                            show: Notify.User.isPremiumFreepik() ? dialog.showPremiumFreepik : !dialog.showPremiumFreepik,
                        });
                    }

                    if ('undefined' !== typeof dialog.showPremiumFreepikAnnual) {
                        booleanArr.push({
                            name: 'dialog.showPremiumFreepikAnnual',
                            show: Notify.User.isPremiumFreepikAnnual() ? dialog.showPremiumFreepikAnnual : !dialog.showPremiumFreepikAnnual,
                        });
                    }

                    if ('undefined' !== typeof dialog.showPremiumFreepikMonthly) {
                        booleanArr.push({
                            name: 'dialog.showPremiumFreepikMonthly',
                            show: Notify.User.isPremiumFreepikMonthly() ? dialog.showPremiumFreepikMonthly : !dialog.showPremiumFreepikMonthly,
                        });
                    }

                    if ('undefined' !== typeof dialog.showPremiumFlaticonAnnual) {
                        booleanArr.push({
                            name: 'dialog.showPremiumFlaticonAnnual',
                            show: Notify.User.isPremiumFlaticonAnnual() ? dialog.showPremiumFlaticonAnnual : !dialog.showPremiumFlaticonAnnual,
                        });
                    }

                    if ('undefined' !== typeof dialog.showPremiumFlaticonMonthly) {
                        booleanArr.push({
                            name: 'dialog.showPremiumFlaticonMonthly',
                            show: Notify.User.isPremiumFlaticonMonthly() ? dialog.showPremiumFlaticonMonthly : !dialog.showPremiumFlaticonMonthly,
                        });
                    }
                    
                    if ('undefined' !== typeof dialog.showFree) {
                        booleanArr.push({
                            name: 'dialog.showFree',
                            show: Notify.User.type().match(/free|guest/gi) ? !!dialog.showFree : true,
                        });
                    }
    
                        
                    if ('function' === typeof dialog.showCallback) {
                        booleanArr.push({
                            name: 'dialog.showCallback',
                            show: dialog.showCallback(),
                        });
                    }
    
                    if ('undefined' !== typeof dialog.showGuestOnly) {
                        booleanArr.push({
                            name: 'dialog.showGuestOnly',
                            show: Notify.User.isLogged() ? !!dialog.showGuestOnly : true,
                        });
                    }
    
                    booleanArr.push({
                        name: 'dialog.schedule',
                        show: dialog.schedule ? (date >= dialog.schedule.dateStart && date <= dialog.schedule.dateEnd) || (debugIgnore) : true,
                    });
    
                    if (dialog.count) {
                        const count = parseFloat(Cookie.getItem(`${Notify.cookieNamespace}--${dialog.id}--count`) || '1');
                        booleanArr.push({
                            name: 'dialog.count',
                            show: count <= dialog.count.max,
                        });
                    }
    
                    if (dialog.hideOnNavigation && Notify.History.getHistoryLength() > 1) {
                        Notify.instance.hide(dialog.id);
                        booleanArr.push({
                            name: 'dialog.hideOnNavigation',
                            show: false,
                        });
                    }
    
                    if ('undefined' !== typeof dialog.showMobile && !dialog.showMobile) {
                        if (window.innerWidth <= parseFloat(Settings.breakpoints.sm)) {
                            booleanArr.push({
                                name: 'dialog.showMobile',
                                show: false,
                            });
                        }
                    }

                    if (dialog.disableOnScheduledPriorities) {
                        dialog.disableOnScheduledPriorities.forEach(priority => {
                            Notify.queue.forEach(dialog => {
                                if (dialog.priority == priority) {
                                    if (dialog.schedule) {
                                        if (date >= dialog.schedule.dateStart && date <= dialog.schedule.dateEnd) {
                                            booleanArr.push({
                                                name: 'dialog.disableOnScheduledPriorities && dialog.schedule',
                                                show: false
                                            });  
                                        } 
                                    } else {
                                        booleanArr.push({
                                            name: 'dialog.disableOnScheduledPriorities',
                                            show: false,
                                        });
                                    }
                                }
                            });
                        });
                    }

                    if (isDebugEnviroment) {
                        qq('.debug').forEach(debugBarElement => debugBarElement.classList.add('hide'));
                        console.log(`Show ${dialog.id}: ${0 === booleanArr.filter(argument => !(argument.show)).length ? true : false}`, booleanArr);
                    }

                    return 0 === booleanArr.filter(argument => !(argument.show)).length;
                }

                return false;
            });
        const settings = queue.shift();

        if (settings) {
            if ('custom' !== settings.type && settings.preload) {
                await Notify.preload(settings);

                if (settings.preloadDependencies) {
                    await Notify.preloadDependencies(settings.preloadDependencies);

                    let dependencyLoaded: boolean[] = [];

                    settings.preloadDependencies.forEach(dependency => {
                        dependencyLoaded.push(ww[dependency.variable] ? true : false);
                    });

                    if (dependencyLoaded.indexOf(false) !== -1) {
                        return;
                    }
                }
            }

            if ('notification' === settings.type) {
                Notify.printMethodNotification(settings);
            }

            if ('banner' === settings.type) {
                Notify.printMethodBanner(settings);
            }

            if ('popup' === settings.type) {
                Notify.printMethodPopup(settings);
            }
            
            if ('custom' === settings.type) {
                Notify.printMethodCustom(settings);
            }
        }
    }

    public hide(id: string) {
        const element = 
            document.getElementById(`modal-${id}`) || 
            document.getElementById(`notification-${id}`) || 
            document.getElementById(id);
        const settings = Notify.queue.filter(dialog => dialog.id === id).shift();

        if (settings) {
            const expires = 
                (settings.schedule && settings.schedule.dateExpire) ? 
                    settings.schedule.dateExpire : 
                    (settings.expires ? 
                            settings.expires(new Date()) : 
                            new Date(new Date().getTime() + (1 * 60 * 60 * 1000)) );

            Cookie.setItem(`${Notify.cookieNamespace}--${settings.id}`, '0', {
                expires: expires
            });
        }
        else {
            const expires = new Date(new Date().getTime() + (3 * 60 * 60 * 1000));

            Cookie.setItem(`${Notify.cookieNamespace}--${id}`, '0', {
                expires: expires
            });
        }

        if (element && element.parentElement) {
            element.parentElement.removeChild(element);
        }
    }
}

type DialogType = 'popup' | 'banner' | 'notification' | 'custom';
export type SettingsTypes = DialogBannerSettings | DialogPopupSettings | DialogNotificationSettings;

interface DialogSettings {
    id: string;
    class?: string;
    extra?: { [name: string]: any },
    html: string;
    type?: DialogType;
    schedule?: {
        dateStart: Date;
        dateEnd: Date;
        dateExpire?: Date;
        dateIgnoreOnDebug?: boolean;
    }
    showFree?: boolean;
    showGuestOnly?: boolean;
    showPremium?: boolean;
    showPremiumFreepik?: boolean;
    showPremiumFlaticon?: boolean;
    showPremiumFreepikAnnual?: boolean;
    showPremiumFreepikMonthly?: boolean;
    showPremiumFlaticonAnnual?: boolean;
    showPremiumFlaticonMonthly?: boolean;
    showMobile?: boolean;
    showCallback?: () => boolean;
    expires?: (date: Date) => Date;
    count?: {
        max: number;
    };
    callback?: Function;
    hideOnNavigation?: boolean;
    priority: number;
    preload?: boolean;
    preloadAdditional?: string[];
    preloadDependencies?: DependenciesObject[];
    disableOnScheduledPriorities?: number[];
}

export interface DialogBannerOptions extends DialogSettings {
    position: 'top' | 'bottom';
    template?: Function;
};
export interface DialogBannerSettings extends DialogBannerOptions {
    type: 'banner';
};

export interface DialogNotificationOptions extends DialogSettings {
    position: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'center' | 'top-center' | 'top-left' | 'top-right';
    template?: Function;
};
export interface DialogNotificationSettings extends DialogNotificationOptions {
    type: 'notification';
};

export interface DialogPopupOptions extends DialogSettings {
    globalVariables?: { [name: string]: any; }
};
export interface DialogPopupSettings extends DialogSettings {
    type: 'popup';
    globalVariables?: { [name: string]: any; }
};

export interface DialogCustomOptions {
    id: string;
    callback: Function;
    schedule?: {
        dateStart: Date;
        dateEnd: Date;
        dateExpire?: Date;
        dateIgnoreOnDebug?: boolean;
    }
    showFree?: boolean;
    showGuestOnly?: boolean;
    showPremium?: boolean;
    showPremiumFreepik?: boolean;
    showPremiumFlaticon?: boolean;
    showPremiumFreepikAnnual?: boolean;
    showPremiumFreepikMonthly?: boolean;
    showPremiumFlaticonAnnual?: boolean;
    showPremiumFlaticonMonthly?: boolean;
    showMobile?: boolean;
    showCallback?: () => boolean;
    expires?: (date: Date) => Date;
    count?: {
        max: number;
    };
    hideOnNavigation?: boolean;
    priority: number;
    disableOnScheduledPriorities?: number[];
    closeCallback: (closeCallback: Function) => void;
};
export interface DialogCustomSettings {
    id: string;
    type: 'custom';
    callback: Function;
    schedule?: {
        dateStart: Date;
        dateEnd: Date;
        dateExpire?: Date;
        dateIgnoreOnDebug?: boolean;
    }
    showFree?: boolean;
    showGuestOnly?: boolean;
    showPremium?: boolean;
    showPremiumFreepik?: boolean;
    showPremiumFlaticon?: boolean;
    showPremiumFreepikAnnual?: boolean;
    showPremiumFreepikMonthly?: boolean;
    showPremiumFlaticonAnnual?: boolean;
    showPremiumFlaticonMonthly?: boolean;
    showMobile?: boolean;
    showCallback?: () => boolean;
    expires?: (date: Date) => Date;
    count?: {
        max: number;
    };
    hideOnNavigation?: boolean;
    priority: number;
    disableOnScheduledPriorities?: number[];
    closeCallback: (closeCallback: Function) => void;
};

export class KEventShow extends KEvent {
    constructor(public settings: DialogBannerSettings | DialogNotificationSettings | DialogPopupSettings) {
        super();
        this.type = `show`;
        this.extra = settings;
    }
}

export class KEventHide extends KEvent {
    constructor(public settings: DialogBannerSettings | DialogCustomSettings | DialogNotificationSettings | DialogPopupSettings) {
        super();
        this.type = `hide`;
        this.extra = settings;
    }
}

export interface DependenciesObject {
    id: string;
    url: string;
    variable: string;
}

export interface NotifyMethods {
    banner: Notification;
    popup: Modal;
}

export interface NotifyUser {
    isLogged(): boolean;
    isPremiumFreepik(): boolean;
    isPremiumFlaticon(): boolean;
    isPremiumFreepikAnnual(): boolean;
    isPremiumFreepikMonthly(): boolean;
    isPremiumFlaticonAnnual(): boolean;
    isPremiumFlaticonMonthly(): boolean;
    type(): 'guest' | 'free' | 'premium';
}

export interface NotifyHistory {
    getHistoryLength(): number;
}

export interface NotifyOptions {
    User: NotifyUser;
    History: NotifyHistory;
}