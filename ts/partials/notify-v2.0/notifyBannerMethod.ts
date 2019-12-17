import { NotifyMethod, NotifyMethodOptions } from './notifyMethod';
import { qq } from 'bobjoll/ts/library/dom';
import Notifications from 'bobjoll/ts/partials/notification-v2.0';

export class NotifyBannerMethod extends NotifyMethod {
    private static readonly notificationBaseClass =
        'notify notify--banner notification--static notification--no-shadow notification--no-border notification--hide-disable mg-none-i';
    private static notification = new Notifications({
        fixed: true,
        recurrent: true,
    });
    private id: string;
    private options: NotifyBannerMethodOptions;
    private bannerTop: HTMLElement;
    private bannerBottom: HTMLElement;

    constructor(options: NotifyBannerMethodOptions) {
        super({ ...options });
        this.options = options;
        this.setup();
    }

    private setup() {
        if (!document.getElementById('notify-top')) {
            document.body.insertAdjacentHTML('afterbegin', '<div id="notify-top" class="notify-wrapper notify-wrapper--top"></div>');
        }
        if (!document.getElementById('notify-bottom')) {
            document.body.insertAdjacentHTML('afterbegin', '<div id="notify-bottom" class="notify-wrapper notify-wrapper--bottom"></div>');
        }
        this.bannerTop = document.getElementById('notify-top') as HTMLElement;
        this.bannerBottom = document.getElementById('notify-bottom') as HTMLElement;
    }

    protected async insert() {
        const settings: NotifyBannerMethodNotificationSettings = {
            ...this.options.bannerOptions,
            id: this.options.id,
            class: `${NotifyBannerMethod.notificationBaseClass} ${this.options.bannerOptions.class || ''}`,
            insert: {
                element: 'top' === this.options.position ? this.bannerTop : this.bannerBottom,
                position: 'beforeend',
            },
        };
        this.id = NotifyBannerMethod.notification.insert(settings);
        [...qq('.notification__close', this.bannerTop), ...qq('.notification__close', this.bannerBottom)].forEach(buttonClose =>
            buttonClose.addEventListener('click', () => this.dispatchEventHide(this.options.id)),
        );
    }
    protected remove() {
        if (this.id) {
            NotifyBannerMethod.notification.hide(this.id);
        }
    }
}

export interface NotifyBannerMethodOptions extends NotifyMethodOptions {
    bannerOptions: NotifyBannerMethodNotificationOptions;
    position: 'top' | 'bottom';
}

export interface NotifyBannerMethodNotificationOptions {
    class?: string;
    html: string;
}

export interface NotifyBannerMethodNotificationSettings extends NotifyBannerMethodNotificationOptions {
    id: string;
    insert: {
        element: HTMLElement;
        position: 'beforeend';
    };
}
