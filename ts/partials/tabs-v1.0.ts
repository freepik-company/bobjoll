import { EventListenerOn } from 'Helpers';
import * as Settings from 'Settings';
import 'BobjollPath/library/common';

(function() {
	let active: HTMLElement[] = [];

	EventListenerOn('body', '.tabs__link', 'click', function(this: HTMLElement, e: Event) {
		let id: string | undefined = this.dataset['tab'];

		console.log(id);

		if (id) {
			e.preventDefault();

			let tab = document.getElementById(id);

			if (tab) {
				let parents = tab.parents('.tabs');

				if (parents && parents.length > 0) {
					let tabWrapper = parents[0];
					let tabWrapperButtons = tabWrapper.querySelectorAll('.tabs__link');

					if (tabWrapperButtons.length > 0) {
						[].forEach.call(tabWrapperButtons, (element: HTMLElement) => {
							if (element.dataset['tab'] !== id || element.classList.contains('active') && window.innerWidth <= Settings.breakpoints.sm) {
								element.classList.remove('active');
							} else {
								element.classList.add('active');
							}
						});
					}
				}
			}
		}
	});

	window.addEventListener('resize', () => {
		if ((window as any).tabsTimeout) clearTimeout((window as any).tabsTimeout);

		(window as any).tabsTimeout = setTimeout(function() {
			let tabs = document.getElementsByClassName('tabs');

			[].forEach.call(tabs, (element: HTMLElement) => {				
				let tabsButtons = element.querySelectorAll('.tabs__link.active'); // Active tab

				if (tabsButtons.length === 0) {
					let tabsButton = (<HTMLElement>element.querySelector('.tabs__link')); // First tab
					
					if (tabsButton) {
						let id = tabsButton.dataset['tab'];

						if (id) {							
							let tabsButtons = element.querySelectorAll('.tabs__link[data-tab="' + id + '"]'); // Tab buttons with same id

							if (tabsButtons) {
								[].forEach.call(tabsButtons, (element: HTMLElement) => {
									element.classList.add('active');
								});
							}
						}
					}
				}
			});
		}, 150);
	});
})();
