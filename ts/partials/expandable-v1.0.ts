import { EventListenerOn, EventListenerOff } from 'Helpers';

(function() {
	EventListenerOn('body', '.expandable__more', 'click', function(this: HTMLElement, e: Event) {
		e.preventDefault();

		let parent = this.parentElement;

		if (parent) {
			let children: NodeListOf<Element> | null = parent.getElementsByTagName('li');

			if (children && children.length > 0) {
				[].forEach.call(children, (element: HTMLElement) => {
					element.classList.remove('hide');
				});			
			}

			parent.removeChild(this);		
		}
	});
})();
