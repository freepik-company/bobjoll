interface ModalAddSettings {
    name: string;
    html?: string;
    media?: string;
    multilayer?: boolean;
}

interface ModalHideSettings {
    all?: boolean;
    show?: string;
    dispatch?: boolean;
}

interface ModalPrintSettings {
    name: string;
    html: string;
    show?: boolean;
    media?: string;
    multilayer?: boolean;
}

import View from 'BobjollView';
import { EventListenerOn } from 'Helpers';
import 'bobjoll/ts/library/common';

var extend = require('bobjoll/ts/library/extend');

class Modal {
    modalsActive: string[];
    modalsMultilayer: string[];
    modalsAddSettings: ModalAddSettings;
    modalsPrintSettings: ModalPrintSettings;
    modalsWrapper: HTMLElement;

    constructor() {
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
        let modal = document.getElementById(`modal-${config.name}`);

        if (!modal) {
            let template = require(`BobjollTemplate/modal-v1.0/element.${View.ext}`);

            this.modalsWrapper.insertAdjacentHTML('beforeend', View.render(template, config));
        }

        if (config.multilayer && this.modalsMultilayer.indexOf(`modal-${config.name}`) < 0) {
            this.modalsMultilayer.push(`modal-${config.name}`);
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
            let modalSpliceList: number[] = [];
            let modalHideAll = settings && settings.all ? true : false;
            let modalEvent = new Event('hide');

            [].forEach.call(this.modalsActive, (id: string, index: number) => {
                let show = (settings && typeof settings.show !== 'undefined' ? (settings.show === id ? true : false) : false);
                let modal = document.getElementById(id);

                if (modal && (modalHideAll || !show)) {
                    let multilayer = this.modalsMultilayer.indexOf(id) < 0 ? false : true;

                    if (modalHideAll || (multilayer && this.modalsActive.length == 1 || !show && !multilayer)) {
                        modal.classList.remove('active');

                        modalSpliceList.push(index);                        

                        if (typeof settings === 'undefined' || typeof settings.dispatch === 'undefined' || settings.dispatch) modal.dispatchEvent(modalEvent);
                    }
                }
            });

            modalSpliceList
                .sort((a, b) => b - a)
                .forEach((position) => this.modalsActive.splice(position, 1));
        }

        if (this.modalsActive.length === 0) {
            document.body.classList.remove('overflow-hidden');
        }
    }

    print(settings: ModalPrintSettings, show: boolean = true) {
        let config = extend(this.modalsPrintSettings, settings);
        let modal = document.getElementById(`modal-${config.name}`);

        if (!modal) {
            let addSettings: ModalAddSettings = {
                name: config.name,
                multilayer: config.multilayer
            };

            if (config.media) {
                addSettings.media = config.media;
            }

            this.add(addSettings);

            modal = document.getElementById(`modal-${config.name}`);
        }

        if (modal) {
            let modalContent = modal.querySelector('.content');

            if (modalContent) {
                modalContent.innerHTML = config.html;
            }

            if (show) {
                this.show(`modal-${config.name}`);
            }
        }
    }

    addEventListeners() {
        let modal = this;

        window.addEventListener('mouseup', (e: Event) => {
            const target: EventTarget | null = e.target;

            if (target instanceof HTMLElement) {
                const wrapper = target.parents('.modal');
                const container = target.parents('.modal__container');
                if ((0 < wrapper.length || target.classList && target.classList.contains('modal')) && 0 === container.length) {
                    this.hide();
                }
            }
        });

        EventListenerOn('body', '.modal__close', 'click', function(this: HTMLElement, e: Event) {
            modal.hide();
        });

        EventListenerOn('body', '.modal__trigger', 'click', function(this: HTMLElement, e: Event) {
            if (!this.dataset.allowDefault) {
                e.preventDefault();
                e.stopPropagation();
            }

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

export var modal = new Modal();