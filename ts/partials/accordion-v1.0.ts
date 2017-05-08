import { EventListenerOn, EventListenerOff } from 'Helpers';
import 'BobjollPath/library/common';

(function() {
	var accordion_resize_timeout: any;

	EventListenerOn('body', '.accordion__link', 'click', function(this: HTMLElement, e: Event) {		
		e.preventDefault();

		let parents = this.parents('.accordion');

		if (parents.length > 0) {
			let wrapper: HTMLElement = (<HTMLElement>parents[0]);
			let links: NodeListOf<Element> = wrapper.querySelectorAll('.accordion__link');
			let closable: string | undefined = wrapper.dataset['closable'];

			if (links.length > 0) {
				[].forEach.call(links, (element: HTMLElement) => {
					if (this !== element) {
						element.classList.remove('active');
					}
				});
			}

			if (closable == 'true') {
				this.classList.toggle('active');
			} else {
				this.classList.add('active');				
			}
		}
	});
})();
