import { KEvent, KEventTarget } from '../library/event';
import { qq, delegate, delegateRemove } from '../library/dom';

export class Trigger extends KEventTarget {
    private static instance: Trigger;
    private static active: TriggerActive = {};

    constructor() {
        super();
        Trigger.instance = this;
    }

    public addEventListener(t: 'toggle', listener: (ev: KEventToggle) => any, useCapture?: boolean): void;
    public addEventListener(t: 'show', listener: (ev: KEventShow) => any, useCapture?: boolean): void;
    public addEventListener(t: 'hide', listener: (ev: KEventHide) => any, useCapture?: boolean): void;
    public addEventListener(t: string, listener: (ev: KEvent) => any, useCapture: boolean = true): void {
        super.addEventListener(t, listener, useCapture);
    }

    public static async initialize() {
        if (document.readyState || await Trigger.readyState()) {
            if (!Trigger.instance) {
                new Trigger();
                Trigger.addEventListeners();
            }
        }
        
        return Trigger.instance;
    }

    public static show(id: string) {
        const container = Trigger.getContainer(id);

        if (container) {
            container.classList.add('active');
            qq(`.trigger__button[data-trigger="${id}"]`)
                .forEach(trigger => trigger.classList.add('active'));
            Trigger.addTrigger(container);
            Trigger.instance.dispatchEvent(new KEventShow(container));
        }
    }

    public static hide(id: string) {
        const container = Trigger.getContainer(id);

        if (container) {
            container.classList.remove('active');
            qq(`.trigger__button[data-trigger="${id}"]`)
                .forEach(trigger => trigger.classList.remove('active'));
            Trigger.removeTrigger(container);
            Trigger.instance.dispatchEvent(new KEventHide(container));
        }
    }

    public static destroy() {
        Trigger.removeEventListeners();
    }

    private static addEventListeners() {
        delegate('.trigger__button', 'click', Trigger.eventHandlerToggleButton);
        delegate('.trigger__close', 'click', Trigger.eventHandlerCloseButton);
    }

    private static removeEventListeners() {
        delegateRemove('.trigger__button', 'click', Trigger.eventHandlerToggleButton);
        delegateRemove('.trigger__close', 'click', Trigger.eventHandlerCloseButton);
    }

    private static readyState() {
        return new Promise(resolve => window.addEventListener('load', resolve));
    }

    private static addTrigger(container: HTMLElement) {
        const settings = Trigger.getSettings(container);

        if (settings.lockScroll) {
            document.body.classList.add('overflow-hidden');
        }

        Trigger.getActiveTrigger().forEach(id => this.hide(id));
        Trigger.active[container.id] = settings;
        Trigger.updateTrigger(container.id);
    }

    private static removeTrigger(container: HTMLElement) {
        if (Trigger.active[container.id]) {
            const settings = Trigger.active[container.id];

            if (settings.lockScroll) {
                document.body.classList.remove('overflow-hidden');
            }

            delete Trigger.active[container.id];
        }

        Trigger.updateTrigger();
    }

    private static updateTrigger(id?: string) {
        document.body.dataset.trigger = Trigger.getActiveTrigger(true).join(' ') || id || '';
    }

    private static getContainer(id: string) {
        return <HTMLElement|undefined>document.getElementById(id);
    }

    private static getSettings(container: HTMLElement) {
        return {
            id: container.id,
            permanent: container.dataset.permanent ? true : false,
            lockScroll: container.dataset.lockScroll ? true : false,
        }
    }

    private static getActiveTrigger(permanent: boolean = false) {
        return Object.keys(Trigger.active)
            .reduce((acc: string[], key) => {
                const settings = Trigger.active[key];

                if (settings && settings.permanent == permanent) {
                    acc.push(settings.id);
                }

                return acc;
            }, []);
    }

    private static eventHandlerToggleButton(this: HTMLElement, e: Event) {
        const id = this.dataset.trigger || '';
        const action = this.classList.contains('active') ? 'hide' : 'show';

        Trigger[action](id);

        Trigger.instance.dispatchEvent(new KEventToggle(this, action));
    }

    private static eventHandlerCloseButton(this: HTMLElement, e: Event) {

    }
}

Trigger.initialize();

export interface TriggerActive {
    [name: string]: {
        id: string;
        permanent: boolean;
        lockScroll: boolean;
    }
};

export class KEventToggle extends KEvent {
    constructor(container: HTMLElement, action: 'hide' | 'show') {
        super();
        this.type = 'toggle';
        this.extra = {
            action: action,
            container: container
        };
    }
}

export class KEventShow extends KEvent {
    constructor(container: HTMLElement) {
        super();
        this.type = 'show';
        this.extra = {
            container: container
        };
    }
}

export class KEventHide extends KEvent {
    constructor(container: HTMLElement) {
        super();
        this.type = 'hide';
        this.extra = {
            container: container
        };
    }
}