import 'bobjoll/ts/library/common';
import { delegate } from 'bobjoll/ts/library/dom';

export default class Scroll {
    private static readonly requestAnimationFrame = (
        (window as any).requestAnimationFrame ||
        (window as any).webkitRequestAnimationFrame ||
        (window as any).mozRequestAnimationFrame ||
        (window as any).msRequestAnimationFrame ||
        (window as any).oRequestAnimationFrame
    ).bind(window);

    private static callbacks: Function[] = [];
    private static instance: Scroll;
    private static position: Number;

    constructor() {
      Scroll.position = Scroll.getPosition();
      this.addEventListeners();
    }

    private addEventListeners() {
      const self = this;

      delegate('.scrollTo', 'click', function (this: HTMLElement, e: Event) {
        e.preventDefault();

        let id: string | null = self.getTarjetId(this.getAttribute('href')) || '';

        let tarjetElement: HTMLElement | null = document.getElementById(id) || null;
        if (tarjetElement !== null) {
          self.scrollTo(tarjetElement, 300);
        }
      });
    }

    private getTarjetId(anchor: string | null) {
      return anchor !== null && anchor.split('#').length > 1
        ? anchor.split('#')[1]
        : anchor || null;
    }

    public static add(callback: Function) {
        return Scroll.callbacks.push(callback);
    }

    public static remove(callbackOrIndex: number | Function)  {
        try {
            if ('function' === typeof callbackOrIndex) {
                Scroll.callbacks.slice(Scroll.callbacks.indexOf(callbackOrIndex), 1);
            } else {
                Scroll.callbacks.slice(callbackOrIndex, 1);
            }
        } catch (err) { }
    }

    public static clear() {
        Scroll.callbacks = [];
    }

    private static callback() {
        const position = Scroll.getPosition();

        if (position !== Scroll.position) {
            const direction = position > Scroll.position ? 'down' : 'up';

            Scroll.callbacks.forEach(function (callback) {
                try {
                    callback(position, direction);
                } catch (e) {
                    console.warn(e);
                }
            });

            Scroll.position = Scroll.getPosition();
        }

        Scroll.requestAnimationFrame(Scroll.callback);
    }

    public static getPosition() {
        return window.pageYOffset || (document.body)?document.body.scrollTop:0;
    }

    public scrollTo(destination: HTMLElement | number, duration = 200, easing = 'linear', callback?: Function) {
        const easings: { [key: string]: Function; } = {
            linear(t: number) {
              return t;
            },
            easeInQuad(t: number) {
              return t * t;
            },
            easeOutQuad(t: number) {
              return t * (2 - t);
            },
            easeInOutQuad(t: number) {
              return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            },
            easeInCubic(t: number) {
              return t * t * t;
            },
            easeOutCubic(t: number) {
              return (--t) * t * t + 1;
            },
            easeInOutCubic(t: number) {
              return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            },
            easeInQuart(t: number) {
              return t * t * t * t;
            },
            easeOutQuart(t: number) {
              return 1 - (--t) * t * t * t;
            },
            easeInOutQuart(t: number) {
              return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
            },
            easeInQuint(t: number) {
              return t * t * t * t * t;
            },
            easeOutQuint(t: number) {
              return 1 + (--t) * t * t * t * t;
            },
            easeInOutQuint(t: number) {
              return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
            }
        };
        
        const start = window.pageYOffset;
        const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
    
        const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
        const destinationOffset = typeof destination === 'number' ? destination : destination.offsetTop;
        const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);
    
        if ('requestAnimationFrame' in window === false) {
            window.scroll(0, destinationOffsetToScroll);
            if (callback) {
                callback();
            }
            return;
        }
    
        function scroll() {
            const now = 'now' in window.performance ? performance.now() : new Date().getTime();
            const time = Math.min(1, ((now - startTime) / duration));
            const timeFunction = easings[easing](time);

            window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));
        
            if (
              Math.ceil(window.pageYOffset) === destinationOffsetToScroll ||
              Math.ceil(window.pageYOffset) === (destinationOffsetToScroll-1) ||
              Math.ceil(window.pageYOffset) === (destinationOffsetToScroll+1)
              ) {
                if (callback) {
                    callback();
                }
                return;
            }
        
            requestAnimationFrame(scroll);
        }
    
        scroll();
    }
}

const scroll = new Scroll();