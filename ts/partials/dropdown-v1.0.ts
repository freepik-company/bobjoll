import { EventListenerOn, EventListenerOff } from 'Helpers';
import 'BobjollPath/library/common';

(function() {
	let template = require('../templates/dropdown.hbs');
	let dropdown: NodeListOf<Element> = document.querySelectorAll('.dropdown select');

	// Build Dropdown
	[].forEach.call(dropdown, (element: HTMLElement) => {
		element.insertAdjacentHTML('afterend', template(element));
	});

	EventListenerOn('body', '.dropdown__button', 'click', function(this: HTMLElement, e: Event) {
		e.preventDefault();

		let parents = this.parents('.dropdown');
		let active = this.classList.contains('active');

		if (parents.length > 0) {
			let search: HTMLInputElement | null = parents[0].querySelector('input');

			if (search) {
				search.focus();			
			}

			removeActive();

			if (!active) {
				this.classList.add('active');
			}
		}
	});

	EventListenerOn('body', '.dropdown__select li', 'click', function(this: HTMLElement, e: Event) {
		e.preventDefault();

		let parents = this.parents('.dropdown');

		if (parents.length > 0) {
			let dropdown = parents[0];
			let eventChange: Event = new Event('change');
			let select: HTMLSelectElement | null = dropdown.querySelector('select');
			let button: Element | null = dropdown.querySelector('.dropdown__button');

			if (select) {
				let value = this.dataset['value'];

				if (value) select.value = value;

				select.dispatchEvent(new Event('change'));				
			}

			if (button) {
				let text = this.innerText;

				if (text) button.innerHTML = text;

				button.classList.remove('active');				
			}
		}
	});

	EventListenerOn('body', '.dropdown__search input', 'keyup', function(this: HTMLInputElement, e: KeyboardEvent) {
		e.preventDefault();

		let value: string = this.value.trim();

		if (value.length > 0) {
			let parents = this.parents('.dropdown');

			if (parents.length > 0) {
				let dropdown = parents[0];
				let options: NodeListOf<Element> = dropdown.querySelectorAll('.dropdown__select li');
				let keyword = new RegExp(value, 'gi');

				if (options.length > 0) {
					[].forEach.call(options, (element: HTMLElement) => {
						let text = element.innerText;
						let value = element.dataset['value'];

						if ((text && text.match(keyword)) || (value && value.match(keyword))) {
							element.classList.remove('hide');
						} else {
							element.classList.add('hide');
						}
					});
				}
			}
		} else {
			resetSearch(this);
		}

		if (e.keyCode === 27) {
			if (value.length > 0) {
				let parents = this.parents('.dropdown');

				if (parents.length > 0) {
					let dropdown = parents[0];
					let button = dropdown.querySelector('.dropdown__button');

					if (button) {
						button.classList.remove('active');						
					}
				}
			}

			resetSearch(this);
		}
	});

	window.addEventListener('mouseup', (e: Event) => {
		if((<Element>e.target).parents('.dropdown').length == 0) {
			removeActive();
		}
	});

	function resetSearch(element: HTMLInputElement) {
		element.value = '';

		let parents = element.parents('.dropdown');

		if (parents.length > 0) {
			let options: NodeListOf<Element> = parents[0].querySelectorAll('.dropdown__select li');

			if (options.length > 0) {
				[].forEach.call(options, (element: HTMLElement) => {
					element.classList.remove('hide');
				});
			}
		}
	}

	function removeActive() {
		let dropdown: NodeListOf<Element> = document.querySelectorAll('.dropdown__button.active');

		[].forEach.call(dropdown, (element: HTMLElement) => {
			element.classList.remove('active');
		});
	}
})(); 
