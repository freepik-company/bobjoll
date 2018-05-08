import { EventListenerOn } from 'Helpers';
import 'bobjoll/ts/library/common';

(function() {
    EventListenerOn('body', '.password__toggle', 'click', function (this: HTMLElement, e: Event) {
        const parents = this.parents('.password');

        if (parents.length > 0) {
            const password = parents[0];
            const input = <HTMLInputElement>password.querySelector('input');

            if (input) {
                const state = password.classList.toggle('password--show');

                input.type = state ? 'text' : 'password';
            }
        }
    });
})();