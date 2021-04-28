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
	private instance: Boolean = false;
	private eventHandlers: DropdownEventHanlder[] = [];

	constructor(options: DropdownOptions) {
		const select = <HTMLSelectElement|undefined>q('select', options.dropdown);

		this.settings = {
			...Dropdown.defaults,
			...options,
		};

		if (options.instance) {
			this.instance = options.instance;
		}

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

		this.eventHandlers.push({
			element: this.select,
			eventType: 'change',
			eventHandler: () => this.update(),
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

	private eventHandlerButtonClick(this: HTMLButtonElement, self: Dropdown) {
		if (self.search) {
			self.search.focus();
		}

		self.close();

		if (!this.classList.contains('active')) {
			this.classList.add('active');
		}
	}

	private eventHandlerItemClick(this: HTMLUListElement, self: Dropdown) {
		const options = qq('option', self.select) as HTMLInputElement[];
        const others = options.filter(option => option.dataset.other);
        const valueSelected = this.dataset?.value;

		if (others.length) {
			others.forEach(other => {
				const fieldElement = q(`input[name="${other.dataset.other || ''}"]`) as HTMLInputElement | undefined;

				if (fieldElement) {
					fieldElement.classList[(valueSelected || '') === other.value ? 'remove' : 'add']('hide');
				}
			});
        }

		if (valueSelected) {
            Dropdown.changeCheckList(self, valueSelected);
			self.select.value = valueSelected;
			self.select.dispatchEvent(new Event('change', {
				bubbles: true,
			}));
		}

		self.button.classList.remove('active');
    }

    public static changeCheckList(dropdown: Dropdown, valueSelected: string) {
        if (!dropdown.select.dataset.checkList) return;

        dropdown.options.forEach(option =>
            q('i', option)?.classList[option.dataset.value === valueSelected ? 'remove' : 'add']('invisible')
		);
    }

	public changeValue(newVal: string) {
		let targetOption = this.options.filter(option => option.dataset.value == newVal)[0];

		this.button.innerText = targetOption.innerText;

		this.select.value = newVal;
		this.select.dispatchEvent(new Event('change', {
			bubbles: true,
		}));

		this.button.classList.remove('active');
		this.button.innerText = targetOption.innerText;
	}

	private eventHandlerInputKeyup(this: HTMLInputElement, self: Dropdown) {
		const value = this.value.trim();
		const keyword = new RegExp(value, 'gi');

		self.options.forEach(option => {
			const text = option.innerText || '';
			const value = option.dataset.value || '';
			option.classList[text.match(keyword) || value.match(keyword) ? 'remove' : 'add']('hide');
		});
	}

	private update() {
		const options = qq('option', this.select) as HTMLInputElement[];

		options.forEach(option => {
			if (this.select.value === option.value) {
				this.button.innerText = option.innerText;
			}
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

		if (!this.instance) {
			this.select.insertAdjacentHTML('afterend',
				View.render(Dropdown.template, {
                    checkList: this.select.dataset.checkList,
					dataset: this.select.dataset,
					options: [].slice.call(this.select.options),
					selectedIndex: this.select.options.selectedIndex
				})
			);
		}

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

        this.settings.dropdown.classList.add('loaded');
	}

	public destroy() {
		const container = q('.dropdown__container', this.settings.dropdown);
		if (container) {
			this.settings.dropdown.removeChild(container);
		}
		this.eventHandlers.forEach(event => event.element.removeEventListener(event.eventType, event.eventHandler));
	}
}

export const initializeDropdown = (loadDynamic = false) =>
    qq(`.dropdown${loadDynamic ? '.dropdown--load-dynamic:not(.loaded)' : ''}`).forEach(dropdown =>
       new Dropdown({ dropdown: dropdown, loadDynamic })
    );

initializeDropdown();

export interface DropdownDefaults {
	search: boolean;
}

export interface DropdownOptions {
	dropdown: HTMLElement;
    instance?: boolean;
    loadDynamic?: boolean;
	search?: boolean;
}

export interface DropdownSettings {
	dropdown: HTMLElement;
    instance?: boolean;
    loadDynamic?: boolean;
	search: boolean;
}

export interface DropdownEventHanlder {
	element: Element;
	eventHandler: EventListenerOrEventListenerObject;
	eventType: string;
}
