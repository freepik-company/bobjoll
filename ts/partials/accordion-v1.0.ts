import 'bobjoll/ts/library/common';
import { delegate, delegateRemove, qq } from 'bobjoll/ts/library/dom';

class Accordion {
	private static instance: Accordion | null;

	constructor() {
		if (!Accordion.instance) {
			Accordion.instance = this;
			this.setup();
		}

		return Accordion.instance;
	}

	private setup() {
		Accordion.setupMobileNavigation();
		Accordion.addEventListeners();
	}

	public refresh() {
		Accordion.setupMobileNavigation();
	}

	public destroy() {
		qq('.accordion__select').forEach(select => select.removeEventListener('change', Accordion.eventSelectChangeHandler));

		delegateRemove('.accordion__link', 'click', Accordion.addEventListeners);

		Accordion.instance = null;
	}

	private static addEventListeners() {
		qq('.accordion__select').forEach(select => select.addEventListener('change', Accordion.eventSelectChangeHandler));

		delegate('.accordion__link', 'click', Accordion.eventClickHandler);
	}

	private static setupMobileNavigation() {
		qq('.accordion:not(.accordion--ready)').forEach(accordion => {
			const options = qq('.accordion__container > a, .accordion__container > button', accordion).reduce((acc, link: HTMLLinkElement, index) => {
				link.classList.add('hide-tablet');

				acc += `<option value="${index}">${link.innerHTML}</option>`;

				return acc;
			}, '');

			accordion.insertAdjacentHTML('afterbegin', `
				<li class="accordion__mobile-nav show-tablet">
					<div class="accordion__select__wrapper">
						<select class="accordion__select">${options}</select>
					</div>
				</li>
			`);

			accordion.classList.add('accordion--ready');
		});
	}

	private static eventClickHandler(this: HTMLElement) {
		const wrapper = <HTMLElement | undefined>this.parent('.accordion');

		if (wrapper) {
			const collapsible = 'true' === (wrapper.dataset.collapsible || wrapper.dataset.closable);

			qq('.accordion__link', wrapper).forEach(item => item.classList.remove('active'));

			(this.classList as any)[collapsible ? 'toggle' : 'add']('active');
		}
	}

	private static eventSelectChangeHandler(this: HTMLSelectElement) {
		const indexActive = parseFloat(this.value);
		const accordion = this.parent('.accordion');

		if (accordion && 'number' === typeof indexActive) {
			qq('.accordion__container > a, .accordion__container > button', (accordion as HTMLElement)).forEach((button: HTMLLinkElement, index) => {
				if (button.classList.contains('accordion__link')) {
					button.classList[indexActive === index ? 'add' : 'remove']('active');
				} else if (button.href && indexActive === index) {
					window.location.href = button.href;
				}
			});
		}
	}
}

const accordion = new Accordion();

export default accordion;