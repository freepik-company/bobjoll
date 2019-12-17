import { Cookie } from 'bobjoll/ts/library/cookie';
import { KEventTarget, KEvent } from 'bobjoll/ts/library/event';
import { Preload } from 'bobjoll/ts/partials/preload-v1.0';
import { User, UserValidationMethods, isDebugTrue, isDebugTypeTrue } from './helpers';

export abstract class NotifyMethod extends KEventTarget {
    private static readonly ns = 'notify';
    private validation: () => UserValidationMethods = User;
    private settings: NotifyMethodSettings;
    private preload: Preload;

    constructor(options: NotifyMethodOptions) {
        super();
        this.settings = {
            conditions: {},
            awaitQuechua: true,
            ...options,
        };
        this.addEventListener('hide', () => this.destroy());
    }

    protected abstract insert(): Promise<void>;
    protected abstract remove(): void;
    protected abstract show(): boolean;

    protected dispatchEventShow(id: string) {
        this.dispatchEvent(new NotifyMethodShow(id));
    }
    protected dispatchEventHide(id: string) {
        this.dispatchEvent(new NotifyMethodHide(id));
    }

    private isValidationTrue(): boolean {
        const validation = this.validation();
        return (
            Object.keys(this.settings.conditions)
                .reduce((acc: boolean[], key) => (acc.push(validation[key]() === this.settings.conditions[key]), acc), [])
                .indexOf(false) === -1
        );
    }
    private isScheduleTrue(): boolean {
        if (this.settings.schedule) {
            const dateCurrent = new Date();
            const dateStart = new Date(this.settings.schedule.dateStart);
            const dateEnd = new Date(this.settings.schedule.dateEnd);
            return dateCurrent >= dateStart && dateCurrent <= dateEnd;
        }
        return true;
    }
    private isShowTrue(): boolean {
        const isDebug = isDebugTrue();
        return (
            (isDebug ? isDebugTypeTrue(this.settings.id) : this.isScheduleTrue()) &&
            this.isValidationTrue() &&
            this.show() &&
            !Cookie.getItem(`notify--${this.settings.id}`)
        );
    }

    public addEventListener(t: 'show', listener: (ev: NotifyMethodShow) => void, useCapture?: boolean): void;
    public addEventListener(t: 'hide', listener: (ev: NotifyMethodHide) => void, useCapture?: boolean): void;
    public addEventListener(t: string, listener: (ev: KEvent) => void, useCapture = true): void {
        super.addEventListener(t, listener, useCapture);
    }
    public destroy() {
        this.remove();
        if (this.settings.preload) {
            this.preload.destroy();
        }
        Cookie.setItem(`${NotifyMethod.ns}--${this.settings.id}`, '1', {
            expires: this.settings.cookieExpire(),
        });
    }
    public getSettings() {
        return this.settings;
    }
    public publish(): Promise<boolean> {
        return new Promise(async resolve => {
            let preloaded = true;
            if (this.isShowTrue()) {
                if (this.settings.preload) {
                    this.preload = new Preload(this.settings.preload);
                    await this.preload.await().catch(() => (preloaded = false));
                }
                if (preloaded) {
                    await this.insert();
                    this.dispatchEventShow(this.settings.id);
                }
                resolve(preloaded);
            }
            resolve(false);
        });
    }
}

export class NotifyMethodShow extends KEvent {
    constructor(id: string) {
        super();
        this.type = `show`;
        this.extra = {
            element: document.getElementById(id),
        };
    }
}

export class NotifyMethodHide extends KEvent {
    constructor(id: string) {
        super();
        this.type = `hide`;
        this.extra = {
            element: document.getElementById(id),
        };
    }
}

export interface NotifyMethodBaseOptions {
    cookieExpire: () => Date;
    id: string;
    preload?: string[];
    priority: number;
    disableOnScheduledPriorities?: number[];
}

export interface NotifyMethodOptions extends NotifyMethodBaseOptions {
    awaitQuechua?: boolean;
    conditions?: NotifyMethodValidationCondition;
    priority: number;
    schedule?: NotifyMethodSchedule;
}

export interface NotifyMethodSettings extends NotifyMethodBaseOptions {
    awaitQuechua: boolean;
    conditions: NotifyMethodValidationCondition;
    priority: number;
    schedule?: NotifyMethodSchedule;
}

export interface NotifyMethodSchedule {
    dateEnd: Date;
    dateExpire?: Date;
    dateStart: Date;
}

export type NotifyMethodValidationCondition = {
    [k in keyof UserValidationMethods]?: boolean;
};
export type NotifyMethodValidationMethod = () => boolean;
export type NotifyMethodValidation = { [key: string]: NotifyMethodValidationMethod };
