import { q, qq, delegate } from 'bobjoll/ts/library/dom';
import { KEvent, KEventTarget } from 'bobjoll/ts/library/event';

interface TriggerActive {
    [name: string]: {
        id: string;
        permanent: boolean;
        lockscroll: boolean;
    }
};

export class KEventShow extends KEvent {
    constructor(container: HTMLElement) {
        super();
        this.type = 'show';
        this.extra = container;
    }
}

export class KEventHide extends KEvent {
    constructor(container: HTMLElement) {
        super();
        this.type = 'hide';
        this.extra = container;
    }
}

class Trigger extends KEventTarget {
    private static readonly wrapper = document.body;
    private static readonly classActive = 'active';
    private static active: TriggerActive = {};

    constructor() {
        super();

        this.addEventListeners();
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

    private static getContainer(id: string) {
        return <HTMLElement>document.getElementById(id) || null;
    }

    private static getSettings(container: HTMLElement) {
        return {
            id: container.id,
            permanent: container.dataset.permanent ? true : false,
            lockscroll: container.dataset.lockScroll ? true : false,
        }
    }

    private static update(id?: string) {
        Trigger.wrapper.dataset.trigger = Trigger.getActiveTrigger(true).join(' ') || id || '';
    }

    public addEventListener(t: 'show', listener: (ev: KEvent) => any, useCapture?: boolean): void;
    public addEventListener(t: 'hide', listener: (ev: KEvent) => any, useCapture?: boolean): void;
    public addEventListener(t: string, listener: (ev: KEvent) => any, useCapture: boolean = true): void {
        super.addEventListener(t, listener, useCapture);
    }

    public show(id: string) {
        const container = Trigger.getContainer(id);

        if (container) {
            container.classList.add(Trigger.classActive);

            qq(`.trigger__button[data-trigger="${id}"]`)
                .forEach(trigger => trigger.classList.add(Trigger.classActive));

            this.add(container);

            this.dispatchEvent(new KEventShow(container));
        }
    }

    public hide(id: string) {
        const container = Trigger.getContainer(id);

        if (container) {
            container.classList.remove(Trigger.classActive);

            qq(`.trigger__button[data-trigger="${id}"]`)
                .forEach(trigger => trigger.classList.remove(Trigger.classActive));

            this.remove(container);

            this.dispatchEvent(new KEventHide(container));
        }
    }

    private add(container: HTMLElement) {
        const settings = Trigger.getSettings(container);

        if (settings.lockscroll) {
            Trigger.container.classList.add('overflow-hidden');
        }

        Trigger.getActiveTrigger()
            .forEach(id => this.hide(id));

        Trigger.active[container.id] = settings;

        Trigger.update(container.id);
    }

    private remove(container: HTMLElement) {
        if (Trigger.active[container.id]) {
            const settings = Trigger.active[container.id];

            if (settings.lockscroll) {
                Trigger.container.classList.remove('overflow-hidden');
            }

            delete Trigger.active[container.id];
        }

        Trigger.update();
    }

    private addEventListeners() {
        const self = this;

        delegate('.trigger__button', 'click', function (this: HTMLButtonElement, e: MouseEvent) {
            const id = this.dataset.trigger || '';
            const action = this.classList.contains('active') ? 'hide' : 'show';

            self[action](id);

            this.dispatchEvent(new Event(`toggle`));
        });

        delegate('.trigger__close', 'click', function (this: HTMLButtonElement, e: MouseEvent) {
            const trigger = this.closest('.trigger');

            if (trigger) {
                const id = trigger.id

                self.hide(id);
            }

            this.dispatchEvent(new Event(`toggle`));
        });
    }
}

export default new Trigger();