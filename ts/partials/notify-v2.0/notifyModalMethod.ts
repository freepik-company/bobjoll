import { modal } from 'bobjoll/ts/partials/modal-v1.0';
import { NotifyMethod, NotifyMethodOptions } from './notifyMethod';

export class NotifyModalMethod extends NotifyMethod {
    private options: NotifyModalMethodOptions;
    private modalElement: HTMLElement | null;

    constructor(options: NotifyModalMethodOptions) {
        super({ ...options });
        this.options = options;
    }

    protected async insert() {
        const {
            id: name,
            modalOptions: { containerHtml, html },
        } = this.options;
        this.modalElement = modal.print(
            {
                containerHtml,
                html,
                name,
                show: true,
            },
            true,
        );
        if (this.modalElement) {
            if (this.options.modalOptions.class) {
                this.modalElement.classList.add(...this.options.modalOptions.class.split(/\s/));
            }
            this.modalElement.addEventListener('hide', () => this.dispatchEventHide(this.options.id));
        }
    }
    protected remove() {
        this.modalElement = null;
    }
    protected show() {
        return true;
    }
}

export interface NotifyModalMethodOptions extends NotifyMethodOptions {
    modalOptions: NotifyModalMethodModalOptions;
}

export interface NotifyModalMethodModalOptions {
    class?: string;
    html: string;
    containerHtml?: string;
}
