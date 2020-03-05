import 'Common';
import { Settings } from 'Settings';
import { delegate } from 'bobjoll/ts/library/dom';

(function() {
	let timeout: number;
	let active: Element[] = [];

	delegate('.popover__trigger', 'click', function(this: HTMLElement, e: Event) {
		e.preventDefault();

		let popover: Element | null = this.parentElement;

		if (popover && popover.classList.contains('popover')) {
			let popoverActive = popover.classList.contains('active');

			hide();

			if (!popoverActive) {
				let popoverEvent = new Event('show');

				popover.dispatchEvent(popoverEvent);
				popover.classList.add('active');
				this.classList.add('active');

				active.push(popover);

				if (popover.classList.contains('popover--mobile-fullscreen')) mobile(popover);
			}
		}
	});

	delegate('.popover__close', 'click', (e: Event) => {
		e.preventDefault();

		hide();
	});

	window.addEventListener('resize', () => {
		if (active && active.length > 0) {
			if(window.innerWidth <= Settings.breakpoints.sm) {
				if (timeout) clearTimeout(timeout);

				timeout = setTimeout(() => {
					[].forEach.call(active, (element: HTMLElement) => {
						let container = element.querySelector('popover__container');

						if (container) {
							container.removeAttribute('style');

							if(window.innerWidth > Settings.breakpoints.sm) container.classList.remove('notransition');
						}

						mobile(element);
					});
				});
			}
		}
	});

	window.addEventListener('mouseup', (e: Event) => {
		let target: EventTarget|null = e.target;

		if (target instanceof HTMLElement) {
			let popover = target.parents('.popover');

			if (popover.length === 0 && active.length > 0) {
				hide();
			}
		}
	});

	function mobile(popover: Element) {
		if (popover && window.innerWidth <= Settings.breakpoints.sm) {
			let container: HTMLElement | null = (<HTMLElement>popover.querySelector('.popover__container'));

			if (container) {
				let containerSpacing: number = 12;
				let containerScrollable: HTMLElement | null = (<HTMLElement>container.querySelector('.scrollable'));
				let containerBounding = container.getBoundingClientRect();

				if (!container.hasAttribute('style')) {
					container.classList.add('notransition');
					container.style.width = document.body.clientWidth + 'px';

					if (containerScrollable) {
						let maxHeight: number = (window.innerHeight - containerBounding.top) - containerSpacing;

						containerScrollable.style.maxHeight = maxHeight + 'px';
					}

					if (popover.classList.contains('popover--bottom-left')) {
						let left: number = containerBounding.left * -1;

						container.style.left = left + 'px';
					}

					if (popover.classList.contains('popover--bottom-right')) {
						let right: number = (document.body.clientWidth - containerBounding.right) * -1;

						container.style.right = right + 'px'
					}
				}
			}
		}
	}

	function hide() {
		if (active.length > 0) {
			let popoverEvent = new Event('hide');

			active.forEach((element: Element, index: number) => {
				let button: Element | null = element.querySelector('.popover__trigger');

				if (button) button.classList.remove('active');

				element.classList.remove('active');
				element.dispatchEvent(popoverEvent);
				element.removeAttribute('style');

				active.splice(index, 1);
			});
		}
	}
})();
