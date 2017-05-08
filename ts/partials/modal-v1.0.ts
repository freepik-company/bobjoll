interface ModalAddSettings {
	name: string;
	html?: string;
	media?: string;
	multilayer?: boolean;
}

interface ModalHideSettings {
	show?: string;
	dispatch?: boolean;
}

interface ModalPrintSettings {
	name: string;
	html: string;
	media?: string;
	multilayer?: boolean;
}

import { EventListenerOn, EventListenerOff } from 'Helpers';
import 'BobjollPath/library/common';
import * as Settings from 'Settings';

var extend = require('BobjollPath/library/extend');

class Modal {
	modalsActive: string[];
	modalsMultilayer: string[];
	modalsAddSettings: ModalAddSettings;
	modalsPrintSettings: ModalPrintSettings;
	modalsWrapper: HTMLElement;

	constructor() {
		let modal = this;

		this.modalsActive = [];
		this.modalsMultilayer = [];
		this.modalsAddSettings = {
			name: '',
			multilayer: false
		};
		this.modalsPrintSettings = {
			name: '',
			html: '',
			multilayer: false
		};
		var modalsWrapper = document.getElementById('modals');

		if (!modalsWrapper) {
			modalsWrapper = document.createElement('div');
			modalsWrapper.id = 'modals';

			document.body.insertAdjacentElement('afterend', modalsWrapper);
		}

		this.modalsWrapper = modalsWrapper;
		this.addEventListeners();
	}

	add(settings: ModalAddSettings) {
		let config = extend(this.modalsAddSettings, settings);
		let modal = document.getElementById(config.name);

		if (!modal) {
			let template = require('BobjollPath/templates/modal.hbs');
			
			this.modalsWrapper.insertAdjacentHTML('afterbegin', template(config));
		}

		if (config.multilayer && this.modalsMultilayer.indexOf(config.name) < 0) {
			this.modalsMultilayer.push(config.name);
		}
	}

	show(id: string) {
		let modal = document.getElementById(id);
		let modalEvent = new Event('show');

		if (modal) {
			modal.classList.add('active');
			document.body.classList.add('overflow-hidden');

			if (modal.dataset['multilayer']) {
				if (this.modalsMultilayer.indexOf(id) < 0) {
					this.modalsMultilayer.push(id);
				}
			}

			if (this.modalsActive.indexOf(id) < 0) {
				this.modalsActive.unshift(id);
			}

			modal.dispatchEvent(modalEvent);
		}
	}

	hide(settings?: ModalHideSettings) {
		if (this.modalsActive.length > 0) {
			let modalEvent = new Event('hide');

			[].forEach.call(this.modalsActive, (id: string, index: number) => {
				let show = (settings && typeof settings.show !== 'undefined' ? (settings.show === id ? true : false) : false);
				let modal = document.getElementById(id);

				if (modal && !show) {
					let multilayer = this.modalsMultilayer.indexOf(id) < 0 ? false : true;

					if (multilayer && this.modalsActive.length == 1 || !show && !multilayer) {
						modal.classList.remove('active');

						this.modalsActive.splice(index, 1);

						if (typeof settings === 'undefined' || typeof settings.dispatch === 'undefined' || settings.dispatch) modal.dispatchEvent(modalEvent);
					}							
				}
			});
		}

		if (this.modalsActive.length === 0) {
			document.body.classList.remove('overflow-hidden');
		}
	}

	print(settings: ModalPrintSettings) {
		let config = extend(this.modalsPrintSettings, settings);
		let modal = document.getElementById(config.name);

		if (!modal) {
			let addSettings: ModalAddSettings = {
				name: config.name,
				multilayer: config.multilayer
			};

			if (config.media) {
				addSettings.media = config.media;
			}

			this.add(addSettings);

			modal = document.getElementById(config.name);
		}

		if (modal) {
			let modalContent = modal.querySelector('.content');

			if (modalContent) {
				modalContent.innerHTML = config.html;
			}

			this.show(config.name);
		}
	}

	addEventListeners() {
		let modal = this;

		EventListenerOn('body', '.modal__close', 'click', function(this: HTMLElement, e: Event) {
			e.preventDefault();

			modal.hide();
		});

		EventListenerOn('body', '.modal__trigger', 'click', function(this: HTMLElement, e: Event) {
			e.preventDefault();

			let id = this.dataset['modal'];

			if (id) {
				modal.show(id);
				modal.hide({show: id});
			}
		});

		window.addEventListener('keyup', (e) => {
			if (e.keyCode === 27) this.hide();
		});
	}
}

var modal = new Modal();

export = modal;
