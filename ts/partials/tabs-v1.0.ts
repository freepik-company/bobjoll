import { EventListenerOn } from 'Helpers';
import 'bobjoll/ts/library/common';

class Tabs {
	constructor() {
		this.addEventListeners();
	}

	public show(id: string) {
		let tab = document.getElementById(id);

		if (tab) {
			let parents = tab.parents('.tabs');

			if (parents && parents.length > 0) {
				let tabWrapper = parents[0];
				let tabWrapperButtons = tabWrapper.querySelectorAll('.tabs__link');

				if (tabWrapperButtons.length > 0) {
					[].forEach.call(tabWrapperButtons, (element: HTMLElement) => {
						if (element.dataset['tab'] !== id || element.classList.contains('active')) {
							element.classList.remove('active');
						}

						if (element.dataset['tab'] === id) {
							element.classList.add('active');
						}
					});
				}
			}
		}
	}

	private addEventListeners() {
		const self = this;

		EventListenerOn('body', '.tabs__link', 'click', function (this: HTMLElement, e: Event) {
			let id: string | undefined = this.dataset['tab'];

			if (id) {
				e.preventDefault();

				self.show(id);
			}
		});

		window.addEventListener('resize', () => {
			if ((window as any).tabsTimeout) clearTimeout((window as any).tabsTimeout);

			(window as any).tabsTimeout = setTimeout(function () {
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
	}
}

export default new Tabs();