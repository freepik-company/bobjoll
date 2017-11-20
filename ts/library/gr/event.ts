'use strict';

export abstract class KEventTarget {
    eventListeners: { [type: string]: ((ev: KEvent) => any)[] };

    constructor() {
        this.eventListeners = {};
    }

    addEventListener(type: string, listener: (ev: KEvent) => any, useCapture: boolean = true) {
        let listeners = this.getListeners(type, useCapture);
        listeners.push(listener);
    }

    removeEventListener(type: string, listener: (ev: KEvent) => any, useCapture: boolean = true) {
        let listeners = this.getListeners(type, useCapture),
            i = listeners.indexOf(listener);
        if (i !== -1) {
            listeners.splice(i, 1);
        }
    }

    dispatchEvent(evt: KEvent): boolean {
        let ancestors: KEventTarget[] = [this],
            parent = this.getParent();

        while (parent != null) {
            ancestors.push(parent);
            parent = parent.getParent();
        }

        evt._target = this;
        ancestors.reverse();
        for (let target of ancestors) {
            target.fireEvent(evt, true);
            if (evt.stopPropagationFlag) {
                return true;
            }
        }

        ancestors.reverse();
        for (let target of ancestors) {
            target.fireEvent(evt, false);
            if (evt.stopPropagationFlag) {
                return true;
            }
        }

        return true;
    }

    private fireEvent(evt: KEvent, capture: boolean): void {
        let listeners = this.getListeners(evt.type, capture);
        evt._currentTarget = this;

        for (let l of listeners) {
            l.call(this, evt);
            if (evt.stopImmediatePropagationFlag) {
                break;
            }
        }
    }

    private getListeners(type: string, capture: boolean) {
        let key = type + (capture ? 'c' : 'b');
        let listeners = this.eventListeners[key];
        if (!listeners) {
            listeners = this.eventListeners[key] = [];
        }
        return listeners;
    }

    getParent(): KEventTarget | null {
        return null;
    }
}

export class KEvent {
    type: string;
    _target: KEventTarget;
    _currentTarget: KEventTarget;
    stopPropagationFlag: boolean;
    stopImmediatePropagationFlag: boolean;
    extra: { [key: string]: any };

    constructor(public wrappedEvent?: Event) {
        if (wrappedEvent) {
            this.type = wrappedEvent.type;
        }
        this.stopPropagationFlag = false;
        this.stopImmediatePropagationFlag = false;
    }

    static fromType(type: string, extra?: { [key: string]: any }): KEvent {
        let ev = new KEvent();
        ev.type = type;
        if (extra) ev.setExtra(extra);
        return ev;
    }

    get target() {
        return this._target;
    }

    get currentTarget() {
        return this._currentTarget;
    }

    setExtra(e: { [key: string]: any }): this {
        this.extra = e;
        return this;
    }

    stopPropagation() {
        this.stopPropagationFlag = true;
        if (this.wrappedEvent) {
            this.wrappedEvent.stopPropagation();
        }
    }

    stopImmediatePropagation() {
        this.stopPropagationFlag = true;
        this.stopImmediatePropagationFlag = true;
        if (this.wrappedEvent) {
            this.wrappedEvent.stopImmediatePropagation();
        }
    }
}
