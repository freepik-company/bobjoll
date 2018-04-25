'use strict';

export abstract class KEventTarget {
    private eventListeners: { [type: string]: ((ev: KEvent) => any)[] };

    constructor() {
        this.eventListeners = {};
    }

    public addEventListener(type: string, listener: (ev: KEvent) => any, useCapture: boolean = true) {
        const listeners = this.getListeners(type, useCapture);
        listeners.push(listener);
    }

    public removeEventListener(type: string, listener: (ev: KEvent) => any, useCapture: boolean = true) {
        const listeners = this.getListeners(type, useCapture);
        const i = listeners.indexOf(listener);
        if (i !== -1) {
            listeners.splice(i, 1);
        }
    }

    public dispatchEvent(evt: KEvent): boolean {
        // console.log('Dispatching', evt, this);
        const ancestors: KEventTarget[] = [this];
        let parent = this.getParent();

        while (parent != null) {
            ancestors.push(parent);
            parent = parent.getParent();
        }

        evt._target = this;
        ancestors.reverse();
        for (const target of ancestors) {
            target.fireEvent(evt, true);
            if (evt.stopPropagationFlag) {
                return true;
            }
        }

        ancestors.reverse();
        for (const target of ancestors) {
            target.fireEvent(evt, false);
            if (evt.stopPropagationFlag) {
                return true;
            }
        }

        return true;
    }

    private fireEvent(evt: KEvent, capture: boolean): void {
        const listeners = this.getListeners(evt.type, capture);
        evt._currentTarget = this;

        for (const l of listeners) {
            l.call(this, evt);
            if (evt.stopImmediatePropagationFlag) {
                break;
            }
        }
    }

    private getListeners(type: string, capture: boolean) {
        const key = type + (capture ? 'c' : 'b');
        let listeners = this.eventListeners[key];
        if (!listeners) {
            listeners = this.eventListeners[key] = [];
        }
        return listeners;
    }

    private getParent(): KEventTarget | null {
        return null;
    }
}

class KDummyEventTarget extends KEventTarget {
}

export class KEvent {
    public type: string;
    public _target: KEventTarget;
    public _currentTarget: KEventTarget;
    public stopPropagationFlag: boolean;
    public stopImmediatePropagationFlag: boolean;
    public extra: { [key: string]: any };

    constructor(public wrappedEvent?: Event) {
        if (wrappedEvent) {
            this.type = wrappedEvent.type;
        } else {
            this.type = 'unknown';
        }
        this._target = this._currentTarget = new KDummyEventTarget();
        this.extra = {};
        this.stopPropagationFlag = false;
        this.stopImmediatePropagationFlag = false;
    }

    // tslint:disable-next-line:function-name
    public static fromType(type: string, extra?: { [key: string]: any }): KEvent {
        const ev = new KEvent();
        ev.type = type;
        if (extra) {
            ev.setExtra(extra);
        }
        return ev;
    }

    public get target() {
        return this._target;
    }

    public get currentTarget() {
        return this._currentTarget;
    }

    public setExtra(e: { [key: string]: any }): this {
        this.extra = e;
        return this;
    }

    public stopPropagation() {
        this.stopPropagationFlag = true;
        if (this.wrappedEvent) {
            this.wrappedEvent.stopPropagation();
        }
    }

    public stopImmediatePropagation() {
        this.stopPropagationFlag = true;
        this.stopImmediatePropagationFlag = true;
        if (this.wrappedEvent) {
            this.wrappedEvent.stopImmediatePropagation();
        }
    }
}
