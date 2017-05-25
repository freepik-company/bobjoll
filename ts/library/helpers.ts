export function EventListenerOn(parentSelector: string, childSelector: string, event: string, callback: Function) {
    let parents = document.querySelectorAll(parentSelector);

    if (parents.length) {
        [].forEach.call(parents, (parent: Element) => {
            event.split(' ').forEach(function(ev) {
                parent.addEventListener(ev, function(e: Event) {
                    let target = (<Element>e.target);

                    if (target) {
                        while (target && !target.matches(parentSelector)) {
                            if (target.matches(childSelector)) {
                                callback.call(target, e);

                                break;
                            }
                            target = (<Element>target.parentNode);
                        }
                    }
                });
            });
        });
    }
}

export function EventListenerOff(parentSelector: string, childSelector: string, event: string, callback: Function) {
    console.warn('EventListenerOff: Not implemented yet');
}