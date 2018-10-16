import '../library/common';
import { qq, q } from "../library/dom";
import View from 'BobjollView';

export class Dropdown {
	private static readonly templateExt = View.ext;
	private static readonly template = require(`BobjollTemplate/dropdown-v1.0/element.${Dropdown.templateExt}`);
	private static readonly defaults: DropdownDefaults = {
		search: false,
	}

	private settings: DropdownSettings;
	private button: HTMLButtonElement;
	private select: HTMLSelectElement;
	private search: HTMLInputElement;
	private options: HTMLUListElement[];
	private eventHandlers: DropdownEventHanlder[] = [];

	constructor(options: DropdownOptions) {
		const select = <HTMLSelectElement|undefined>q('select', options.dropdown);

		this.settings = { ...Dropdown.defaults, ...options };

		if (select) {
			this.select = select;

			try {
				this.render();
				this.addEventListeners();
			} catch(err) {
				console.error(err);
			}
		} else {
			console.error('There was no HTMLSelectElement found in the Dropdown element.');
		}
	}

	private addEventListeners() {
		this.eventHandlers.push({
			element: this.button,
			eventType: 'click',
			eventHandler: this.eventHandlerButtonClick.bind(this.button, this),
		});

		this.options.forEach(option => 
			this.eventHandlers.push({
				element: option,
				eventType: 'click',
				eventHandler: this.eventHandlerItemClick.bind(option, this)
			})	
		);

		if (this.search) {
			this.eventHandlers.push({
				element: this.search,
				eventType: 'keyup',
				eventHandler: this.eventHandlerInputKeyup.bind(this.search, this)
			});
		}

		this.eventHandlers.forEach(event => event.element.addEventListener(event.eventType, event.eventHandler));

		window.addEventListener('mouseup', (e: Event) => {
			const target = <Element>e.target;
			if (target.parents && target.parents('.dropdown').length == 0) {
				this.close();
			}
		});
	}

	private eventHandlerButtonClick(this: HTMLButtonElement, self: Dropdown, e: Event) {
		if (self.search) {
			self.search.focus();
		}

		self.close();

		if (!this.classList.contains('active')) {
			this.classList.add('active');
		}
	}

	private eventHandlerItemClick(this: HTMLUListElement, self: Dropdown, e: Event) {
		if (this.dataset.value) {
			self.select.value = this.dataset.value;
			self.select.dispatchEvent(new Event('change'));
		}

		self.button.classList.remove('active');
		self.button.innerText = this.innerText;
	}

	private eventHandlerInputKeyup(this: HTMLInputElement, self: Dropdown, e: Event) {
		const value = this.value.trim();
		const keyword = new RegExp(value, 'gi');

		self.options.forEach(option => {
			const text = option.innerText || '';
			const value = option.dataset.value || '';
			option.classList[text.match(keyword) || value.match(keyword) ? 'remove' : 'add']('hide');
		});
	}

	private close() {
		qq('.dropdown__button').forEach(dropdown => dropdown.classList.remove('active'));
	}

	private render() {
		if ('true' == this.select.dataset.search || this.settings.search) {
			this.settings.search = true;
			this.select.dataset.search = 'true';
		}

		this.select.insertAdjacentHTML('afterend', 
			View.render(Dropdown.template, {
				options: [].slice.call(this.select.options),
				dataset: this.select.dataset,
				selectedIndex: this.select.options.selectedIndex
			})
		);
		this.options = <HTMLUListElement[]>qq('.dropdown__select li', this.settings.dropdown);

		const button = <HTMLButtonElement|undefined>q('.dropdown__button', this.settings.dropdown);

		if (button) {
			this.button = button;
		} else {
			throw Error('Dropdown wasn\'t initialized correctly, the button element is missing, please check your template.');
		}

		if (this.settings.search) {
			const search = <HTMLInputElement | undefined>q('input', this.settings.dropdown);

			if (search) {
				this.search = search;
			}
		}
	}

	private searchReset() {
		this.search.value = '';
		this.options.forEach(option => option.classList.remove('hide'));
	}

	public destroy() {
		const container = q('.dropdown__container', this.settings.dropdown);
		if (container) {
			this.settings.dropdown.removeChild(container);
		}
		this.eventHandlers.forEach(event => event.element.removeEventListener(event.eventType, event.eventHandler));
	}
}

qq('.dropdown').forEach(dropdown => new Dropdown({ dropdown: dropdown }));

export interface DropdownDefaults {
	search: boolean;
}

export interface DropdownOptions {
	search?: boolean;
	dropdown: HTMLElement;
}

export interface DropdownSettings {
	search: boolean;
	dropdown: HTMLElement;
}

export interface DropdownEventHanlder {
	element: Element;
	eventType: string;
	eventHandler: EventListenerOrEventListenerObject;
}