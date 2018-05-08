interface NotificationAnchor {
	'top-left': HTMLElement | null,
	'top-right': HTMLElement | null,
	'top-center': HTMLElement | null,
	'bottom-left': HTMLElement | null,
	'bottom-right': HTMLElement | null,
	'bottom-center': HTMLElement | null,
	'center': HTMLElement | null
}

type NotificationPosition = keyof NotificationAnchor;

interface NotificationsShowSettings {
	id: string;
	group?: string;
}

interface NotificationsInsertSettings {
	id: string;
	html: string;
	class?: string;
	group?: string;
	timeout?: number;
	position?: NotificationPosition;	
	persistant?: boolean;
	additional?: Object;
}

import View from 'BobjollView';
import * as Settings from 'Settings';

var extend = require('Bobjoll/ts/library/extend');

class Notifications {
	active: string[];
	anchor: NotificationAnchor;
	storage: Storage;
	wrapper: HTMLElement;

	constructor() {
		let template = require(`BobjollTemplate/notification-v1.0/wrapper.${View.ext}`);

		document.body.insertAdjacentHTML('beforeend', View.render(template));

		let notifications = document.getElementById('notifications');

		if (notifications) this.wrapper = notifications;

		this.active = [];
		this.anchor = {
			'top-left': document.getElementById('notifications__top-left'),
			'top-right': document.getElementById('notifications__top-right'),
			'top-center': document.getElementById('notifications__top-center'),
			'bottom-left': document.getElementById('notifications__bottom-left'),
			'bottom-right': document.getElementById('notifications__bottom-right'),
			'bottom-center': document.getElementById('notifications__bottom-center'),
			'center': document.getElementById('notifications__center')
		};
		this.storage = window.localStorage;
	}

	show(settings: NotificationsShowSettings) {
		let data: string | null = this.storage.getItem('n_' + settings.id);
		let dataGroup: string | null = this.storage.getItem('nGroup_' + settings.group);
		let show: boolean = true;
		let showGroup: boolean = true;
			
		if (data) show = data == 'true';

		if (dataGroup && settings.group) {
			showGroup = dataGroup == 'true';

			if (typeof showGroup !== 'undefined' && !showGroup) show = false;
		}

		return show;
	}

	close(notification: HTMLElement | null) {
		if (notification) {
			let index: number = this.active.indexOf(notification.id);
			let group: string | undefined = notification.dataset['group'];
			let persistant: string | undefined = notification.dataset['persistant'];
			let notificationEvent = new Event('hide');

			this.active.splice(index, 1);

			if (persistant) {
				let disable = (<HTMLInputElement | null>notification.querySelector('.notification__disable input[name="notification-persistant"]'));

				if (disable) {
					this.storage.setItem('n_' + notification.id, JSON.stringify(!disable.checked));
				}
			} else {
				this.storage.setItem('n_' + notification.id, JSON.stringify(false));
			}

			if (group) {
				let disable = (<HTMLInputElement | null>notification.querySelector('.notification__disable input[name="notification-group"]'));

				if (disable) {
					this.storage.setItem('nGroup_' + group, JSON.stringify(!disable.checked));
				}
			}		

			notification.classList.add('animation--fade-out');
			notification.dispatchEvent(notificationEvent);

			setTimeout(() => { 
				let notificationParent = notification.parentNode;

				if (notificationParent) {
					notificationParent.removeChild(notification);
				}
			}, parseInt(Settings['base-duration']));			
		}
	}

	insert(settings: NotificationsInsertSettings) {
		let anchor = settings.position ? this.anchor[settings.position] : (this.wrapper ? this.wrapper : null);
		let notification: HTMLElement | null;
		let show = this.show(settings);
		let template = require(`BobjollTemplate/notification-v1.0/element.${View.ext}`);

		if (anchor && show) {
			let position: any = settings.position ? (settings.position.indexOf('top') < 0 ? 'beforeend' : 'afterbegin') : 'beforeend';

			anchor.insertAdjacentHTML(position, View.render(template, settings));
			notification = document.getElementById(settings.id);

			if (notification) {
				let notificationEvent = new Event('show');

				notification.dispatchEvent(notificationEvent);

				this.active.push(settings.id);
				this.notificationEventListeners(notification);

				if (settings.timeout) {
					setTimeout(() => { this.close(notification); }, settings.timeout);
				}
			}
		}
	}

	addEventListeners() {
		window.addEventListener('resize', () => {
			if (this.active.length > 0) {
				this.active.forEach(function(id) {
					let notification = document.getElementById(id);

					if (notification) {
						let notificationBounding = new Event('bounding');

						notification.dispatchEvent(notificationBounding);
					}
				});
			}
		});
	}

	notificationEventListeners(notification: HTMLElement) {
		let notificationCloseButton = notification.querySelector('.notification__close');

		notification.addEventListener('bounding', () => {
			let b = notification.getBoundingClientRect();

			if (b.top < 0 || b.right < 0 || b.bottom < 0 || b.left < 0) {
				this.close(notification);
			}
		});

		if (notificationCloseButton) {
			notificationCloseButton.addEventListener('click', (e: Event) => {
				e.preventDefault();

				this.close(notification);
			});
		}
	}
}

var notifications = new Notifications();

export = notifications;
