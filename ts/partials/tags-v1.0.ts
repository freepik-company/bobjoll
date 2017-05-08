import { EventListenerOn, EventListenerOff } from 'Helpers';

(function() {
	EventListenerOn('body', '.tags .remove', 'click', function(this: HTMLElement, e: Event) {
		e.preventDefault();

		let id: string | null = this.getAttribute('for');

		if (id) {
			let input = (<HTMLInputElement>document.getElementById(id));			

			if (input) {
				let event = new Event('change');

				input.checked = false;

				input.dispatchEvent(event); 
			}			
		}
	});
})();
