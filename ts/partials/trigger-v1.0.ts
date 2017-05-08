import { EventListenerOn, EventListenerOff } from 'Helpers';

(function() {
	EventListenerOn('body', '.trigger__button', 'click', function(this: HTMLElement, e: Event) {
		e.preventDefault();

		let id: string | undefined = this.dataset['trigger'];

		if (id) {
			let trigger = document.getElementById(id);

			if (trigger) {
				let active = trigger.classList.contains('active');

				closeTrigger(id);

				if (!active) {
					this.classList.add('active');
					trigger.classList.add('active');

					document.body.dataset['trigger'] = id;

					if (this.dataset['lockScroll']) {
						console.log('lock');
						document.body.classList.add('overflow-hidden');
					}
				}				
			}
		}
	});

	EventListenerOn('body', '.trigger__close', 'click', function(this: HTMLElement, e: Event) {
		e.preventDefault();

		let parents = this.parents('.trigger');

		if (parents && parents.length) {
			let trigger = parents[0];

			closeTrigger(trigger.id);
		}
	})

	function closeTrigger(current?: string) {
		let triggerActive = document.querySelectorAll('.trigger__button.active');

		if (triggerActive && triggerActive.length > 0) {
			[].forEach.call(triggerActive, (element: HTMLElement) => {
				let id: string | undefined = element.dataset['trigger'];

				if (id && current && current !== id || id) {
					let trigger = document.getElementById(id);

					if (trigger) {
						element.classList.remove('active');
						trigger.classList.remove('active');
					}
				}
			});

			document.body.classList.remove('overflow-hidden');
			document.body.removeAttribute('data-trigger');
		}
	}
})();
