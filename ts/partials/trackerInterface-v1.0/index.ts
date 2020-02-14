/* eslint-disable @typescript-eslint/no-explicit-any */

export class EventInterface {
    private methods: EventInterfaceMethods;

    constructor(methods: EventInterfaceMethods) {
        this.methods = methods;
    }

    private getMethod(methodName: EventInterfaceActiveMethod) {
        return Object.keys(this.methods).reduce((methods: EventInterfaceMethod[], name) => {
            if ('all' === methodName || name === methodName) {
                methods.push(this.methods[name]);
            }
            return methods;
        }, []);
    }

    public send(methodName: EventInterfaceActiveMethod, ...args: any[]) {
        this.getMethod(methodName).forEach(method => method(...args));
    }
}

export type EventInterfaceMethod = (...args: any[]) => void;
export type EventInterfaceMethods = { [name: string]: EventInterfaceMethod };
export type EventInterfaceActiveMethod = 'all' | keyof EventInterfaceMethods;
