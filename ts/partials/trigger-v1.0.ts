import { EventListenerOn } from 'Helpers';

(function() {
	EventListenerOn('body', '.trigger__button', 'click', function(this: HTMLElement, e: Event) {
		e.preventDefault();

		let id: string | undefined = this.dataset['trigger'];

		if (id) {
			let trigger = document.getElementById(id);
			let active = this.classList.contains('active');

			closeTrigger(id);

			if (!active) {
				if (trigger) {
					trigger.classList.add('active');
				}

				this.classList.add('active');

				document.body.dataset['trigger'] = id;

				if (this.dataset['lockScroll']) {
					document.body.classList.add('overflow-hidden');
				}
			}			
		}

		this.dispatchEvent(new Event(`toggle`));
	});

	EventListenerOn('body', '.trigger__close', 'click', function(this: HTMLElement, e: Event) {
		e.preventDefault();

		let parents = this.parents('.trigger');

		if (parents && parents.length) {
			let trigger = parents[0];

			closeTrigger(trigger.id);			
		}

		this.dispatchEvent(new Event(`toggle`));
	})

	function closeTrigger(current?: string) {
		let triggerActive: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.trigger__button.active');

		if (triggerActive && triggerActive.length > 0) {
			[].forEach.call(triggerActive, (element: HTMLElement) => {
				let id: string | undefined = element.dataset['trigger'];

				if ((id && current) && (current !== id) || id) {
					let trigger = document.getElementById(id);

					if (trigger) {
						trigger.classList.remove('active');
					}

					element.classList.remove('active');
				}
			});

			if (triggerActive[0] && triggerActive[0].dataset['lockScroll']) {
				document.body.classList.remove('overflow-hidden');
			}

			document.body.removeAttribute('data-trigger');
		}
	}
})();
