import 'bobjoll/ts/library/common';
import { delegate, delegateRemove, qq } from 'bobjoll/ts/library/dom';
import { IsUrlValid } from 'bobjoll/ts/library/helpers';

class Accordion {
	private static instance: Accordion | null;

	constructor() {
		if (!Accordion.instance) {
			Accordion.instance = this;
			this.setup();
		}

		return Accordion.instance;
	}

	private static addEventListeners() {
		delegate('.accordion__link', 'click', Accordion.eventClickHandler);
	}

	private static setupMobileNavigation() {
		qq('.accordion:not(.accordion--ready)').forEach(element => {
			const options = qq('.accordion__container > a, .accordion__container > button', element)
				.reduce((acc, link, index) => {
					link.classList.add('hide-tablet');

					acc += `<option value="${index}">${link.innerHTML}</option>`;

					return acc;
				}, '');

			element.insertAdjacentHTML('afterbegin', `
                <li class="accordion__mobile-nav show-tablet">
                    <div class="accordion__select__wrapper">
                        <select class="accordion__select">${options}</select>
                    </div>
                </li>
            `);

			element.classList.add('accordion--ready');
		});

		qq('.accordion__select')
			.forEach(select => select.addEventListener('change', Accordion.eventSelectChangeHandler));
	}

	private static eventClickHandler(this: HTMLElement) {
		const wrapper = <HTMLElement | undefined>this.parent('.accordion');

		if (wrapper) {
			const collapsible = 'true' === (wrapper.dataset.collapsible || wrapper.dataset.closable);

			qq('.accordion__link', wrapper).forEach(item => item !== this ? item.classList.remove('active') : null);

			(wrapper.classList as any)[collapsible ? 'toggle' : 'add']('active');
			(this.classList as any)[collapsible ? 'toggle' : 'add']('active');
		}
	}

	private static eventSelectChangeHandler(this: HTMLSelectElement) {
		const indexActive = parseFloat(this.value);
		const wrapper = this.parent('.accordion');

		if (wrapper && 'number' === typeof indexActive) {
			qq('.accordion__container > a, .accordion__container > button', (wrapper as HTMLElement))
				.forEach((button, index) => {
					const href = button.getAttribute('href');

					if (button.classList.contains('accordion__link')) {
						if (indexActive === index) {
							button.click();
						}

						button.classList[indexActive === index ? 'add' : 'remove']('active');
					} else if (href && indexActive === index && IsUrlValid(href)) {
						window.location.href = href;
					}
				});
		}
	}

	public refresh() {
		Accordion.setupMobileNavigation();
	}

	public destroy() {
		qq('.accordion__select')
			.forEach(select => select.removeEventListener('change', Accordion.eventSelectChangeHandler));

		delegateRemove('.accordion__link', 'click', Accordion.addEventListeners);

		Accordion.instance = null;
	}

	private setup() {
		Accordion.setupMobileNavigation();
		Accordion.addEventListeners();
	}
}

const accordion = new Accordion();

export default accordion;