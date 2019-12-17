import { NotifyMethod, NotifyMethodOptions } from './notifyMethod';
import { qq } from 'bobjoll/ts/library/dom';
import Notifications from 'bobjoll/ts/partials/notification-v2.0';

export class NotifyNotificationMethod extends NotifyMethod {
    private static readonly notificationBaseClass = 'notify notify--banner notification--hide-disable';
    private static notification = new Notifications({
        fixed: true,
        recurrent: true,
    });
    private id: string;
    private options: NotifyNotificationMethodOptions;
    private notificationElement: HTMLElement | undefined;

    constructor(options: NotifyNotificationMethodOptions) {
        super({ ...options });
        this.options = options;
    }

    protected async insert() {
        const settings: NotifyNotificationMethodNotificationSettings = {
            ...this.options.notificationOptions,
            id: this.options.id,
            class: `${NotifyNotificationMethod.notificationBaseClass} ${this.options.notificationOptions.class || ''}`,
        };
        this.id = NotifyNotificationMethod.notification.insert(settings);
        this.notificationElement = document.getElementById(this.id) as HTMLElement | undefined;
        if (this.notificationElement) {
            qq('.notification__close', this.notificationElement).forEach(buttonClose =>
                buttonClose.addEventListener('click', () => this.dispatchEventHide(this.options.id)),
            );
        }
    }
    protected remove() {
        if (this.id) {
            NotifyNotificationMethod.notification.hide(this.id);
        }
    }
}

export interface NotifyNotificationMethodOptions extends NotifyMethodOptions {
    notificationOptions: NotifyNotificationMethodNotificationOptions;
}

export interface NotifyNotificationMethodNotificationOptions {
    class?: string;
    html: string;
    position: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'center' | 'top-center' | 'top-left' | 'top-right';
}

export interface NotifyNotificationMethodNotificationSettings extends NotifyNotificationMethodNotificationOptions {
    id: string;
    position: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'center' | 'top-center' | 'top-left' | 'top-right';
}
