
interface Touch {
    identifier: number;
    target: EventTarget;
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
};

interface TouchList {
    length: number;
    [key: number]: Touch;
};

interface TouchEvent extends UIEvent {
    touches: TouchList;
    targetTouches: TouchList;
    changedTouches: TouchList;
    originalEvent: any;
};

import { EventListenerOn, EventListenerOff } from 'Helpers';
import * as Settings from 'Settings';

(function() {
    let touch = (('ontouchstart' in window) || ((navigator as any).MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    let start: number;
    let timeout: number;

    if (touch) {
        EventListenerOn('body', '.scrollable', 'touchstart', function(this: HTMLElement, e: TouchEvent) {
            e.stopPropagation();

            if (timeout) clearTimeout(timeout);

            if (!disable(this)) {
                let touch = getTouchEvent(e);

                start = touch.pageY;
            }
        });

        EventListenerOn('body', '.scrollable', 'touchmove', function(this: HTMLElement, e: TouchEvent) {
            e.stopPropagation();

            if (!disable(this)) {
                let touch = getTouchEvent(e);
                let move = start - touch.pageY;

                if(this.scrollTop + move >= this.scrollHeight - this.clientHeight) {                 
                    e.preventDefault();
                    e.returnValue = false;
                }
            }
        });
    }

    EventListenerOn('body', '.scrollable', 'DOMMouseScroll mousewheel', function(this: HTMLElement, e: any) {
        e.stopPropagation();

        if(!disable(this) && this.scrollHeight > this.clientHeight) {
            var up = (e.type == 'DOMMouseScroll' ? (e.originalEvent).detail * -40 : (e.originalEvent).wheelDelta) > 0,
                h = this.scrollHeight - this.clientHeight,
                c = this.scrollTop / h;

            if ((!up && c === 1) || (up && c === 0) || h === 0) {
                e.preventDefault();
                e.returnValue = false;
            }      
        }
    });

    function disable(element: HTMLElement) {
        if(element.classList.contains('scrollable--xs') && window.innerWidth >= Settings.breakpoints.xs) return true; 
        if(element.classList.contains('scrollable--sm') && window.innerWidth >= Settings.breakpoints.sm) return true;
        if(element.classList.contains('scrollable--md') && window.innerWidth >= Settings.breakpoints.md) return true;
        if(element.classList.contains('scrollable--lg') && window.innerWidth >= Settings.breakpoints.lg) return true;

        return false;
    }

    function getTouchEvent(e: any) {
        let event = (e.originalEvent);

        return event.targetTouches ? event.targetTouches[0] : event.changedTouches[0];
    }
})();
