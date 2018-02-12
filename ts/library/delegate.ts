class DelegateListeners {
    private static listeners: {
        [name: string]: {
            eventType: Event['type'];
            eventHandler: Function;
            elementScopeHandler: EventListener;
        }[];
    } = {};

    public static set(selector: string, eventType: Event['type'], eventHandler: Function, elementScopeHandler: EventListener) {
        if (!DelegateListeners.listeners[selector]) {
            DelegateListeners.listeners[selector] = [];
        }

        if (this.unique(DelegateListeners.listeners[selector], eventType, eventHandler)) {
            let listener = {
                eventType: eventType,
                eventHandler: eventHandler,
                elementScopeHandler: elementScopeHandler,
            };

            DelegateListeners.listeners[selector].push(listener);

            return listener;
        } else {
            return this.get(selector, eventType, eventHandler);
        }
    }

    public static get(selector: string, eventType: Event['type'], eventHandler: Function) {
        if (DelegateListeners.listeners[selector]) {
            try {
                return DelegateListeners.listeners[selector].filter((listener) => {
                    return eventHandler === listener.eventHandler && eventType === listener.eventType;
                })[0];
            } catch (err) { };
        }

        return null;
    }

    public static delete(selector: string, eventType: Event['type'], eventHandler: Function) {
        let deleteListenersID: number[] = [];

        if (DelegateListeners.listeners[selector]) {
            DelegateListeners.listeners[selector].forEach((listener, index: number) => {
                if (eventType === listener.eventType && eventHandler === listener.eventHandler) {
                    deleteListenersID.unshift(index);
                }
            });

            deleteListenersID.forEach((id) => {
                DelegateListeners.listeners[selector].splice(id, 1);
            });

            if (0 === DelegateListeners.listeners[selector].length) {
                delete DelegateListeners.listeners[selector];
            }
        }
    }

    private static unique(listeners: {
        eventType: Event['type'];
        eventHandler: Function;
        elementScopeHandler: EventListener;
    }[], eventType: Event['type'], eventHandler: Function): boolean {
        try {
            let existing = listeners.filter((listener) => {
                return eventHandler === listener.eventHandler && eventType === listener.eventType;
            });

            if (0 === existing.length) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }
}

export function q(selector: string, parent: HTMLElement | Document = document): HTMLElement | null {
    const x = parent.querySelector(selector);
    
    return x ? x as HTMLElement : x;
}

export function qq(selector: string, parent: HTMLElement | Document = document): HTMLElement[] {
    return Array.prototype.slice.call(parent.querySelectorAll(selector), 0);
}

export function delegate(selector: string, eventType: Event['type'], eventHandler: Function, elementScope: HTMLElement | Document = document) {
    let listener = DelegateListeners.set(selector, eventType, eventHandler, function (event: any) {
        try {
            let target = event.target;

            while (target && target !== elementScope) {
                if (target.matches(selector)) {
                    eventHandler.call(target, [event]);
                    break;
                }

                target = (<Element>target.parentNode);
            }
        } catch (err) { }
    });

    if (listener) {
        elementScope.addEventListener(eventType, listener.elementScopeHandler);
    }
}

export function delegateRemove(selector: string, eventType: Event['type'], eventHandler: Function, elementScope: HTMLElement | Document = document) {
    let listener = DelegateListeners.get(selector, eventType, eventHandler);

    if (listener) {
        elementScope.removeEventListener(eventType, listener.elementScopeHandler);

        DelegateListeners.delete(selector, eventType, eventHandler);
    }
}