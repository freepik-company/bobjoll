import { delegate } from 'bobjoll/ts/library/dom';

(function() {
	var upload_wrapper: any = document.querySelectorAll(upload_wrapper);

	delegate('.upload input', 'change', function(this: HTMLInputElement) {
		let label = (this.nextElementSibling as HTMLElement | null);

		if (label && this.files && this.files.length > 0) {
			if (this.files.length > 1) {
				label.innerText = this.files.length + ' files selected.';
			} else {
				label.innerText = this.files[0].name;
			}
		}
	});
})();