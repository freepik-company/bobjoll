import { delegate, qq } from 'bobjoll/ts/library/dom';

(function () {
	delegate('.expandable__more', 'click', function (this: HTMLElement, e: Event) {
		e.preventDefault();

		let parent = this.parentElement;

		if (parent) {
			let children = qq('li', parent);

			children.forEach(element => {
				element.classList.remove('hide');
			});

			parent.removeChild(this);
		}
	});
})();
