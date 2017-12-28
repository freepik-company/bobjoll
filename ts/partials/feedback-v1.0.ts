import { KEvent, KEventTarget } from 'BobjollPath/library/event';
import { sessionStorage as storage } from 'BobjollPath/library/storage';
import { HexBase64BinaryEncoding } from 'crypto';
import * as Settings from 'Settings';

const extend = require('BobjollPath/library/extend');

export class KEventView extends KEvent {
    constructor(public view: string | undefined) {
        super();
        this.type = 'feedback:view';
        this.view = view;
    }
}

interface DefaultSettings {
    default: {
        defaults: boolean;
        history: boolean;
        historyMax: number;
    }
    templates: {
        'fixed': Function;
        'fixed_question': Function;
        'message': Function;
        'static': Function;
    };
}

interface UserSettings {
    action: string;
    method: 'POST' | 'GET';
    text: {
        'close': string;
        'submit': string;
        'cancel': string;
        'msg_error': string;
        'email_info': string;
        'email_error': string;
        'email_label': string;
        'email_placeholder': string;
        'request_error': string;
    };
    default: {
        overlay?: boolean;
        defaults?: boolean;
        options: {
            id?: string;
            icon?: string;
            order?: number;
            class?: string;
            feedback?: {
                contact?: boolean;
                contactRequired?: boolean;
                staged?: boolean;
                label?: string;
                required?: boolean;
                placeholder: string;
            };
            success_msg?: string;
            text?: string;
            value: string;
        }[];
        success_msg?: string;
        history?: boolean;
        historyMax?: number;
        view?: string;
        viewCounter?: {
            view?: string;
            '%': number;
            times?: number;
        }[];
    }
    questions: {
        id?: string;
        class?: string;
        views?: string[], 
        question: string,
        options?: {
            id?: string;
            icon?: string;
            order?: number;
            class?: string;
            feedback?: {
                contact?: boolean;
                contactRequired?: boolean;
                staged?: boolean;
                label?: string;
                required?: boolean;
                placeholder: string;
            };
            success_msg?: string;
            text?: string;
            value: string;
        }[];
    }[];
    templates?: {
        'fixed': Function;
        'fixed_question': Function;
        'message': Function;
        'static': Function;
    },
    user?: () => {
        id: number;
        login: string;
        email: string;
        avatar: string;
        premium: boolean;
        cc_will_expire: boolean;
        connected_google?: boolean;
        connected_facebook?: boolean;
        connected_twitter?: boolean;
    };
}

interface Settings extends UserSettings {
    default: {
        overlay?: boolean;
        defaults: boolean;
        options: {
            id?: string;
            icon?: string;
            order?: number;
            class?: string;
            feedback?: {
                contact?: boolean;
                contactRequired?: boolean;
                label?: string;
                required?: boolean;
                placeholder: string;
            };
            success_msg?: string;
            text?: string;
            value: string;
        }[];
        success_msg?: string;
        history: boolean;
        historyMax: number;
        view?: string;
        viewCounter?: {
            view?: string;
            times?: number;
            '%': number;
        }[];
    }
    templates: {
        'fixed': Function;
        'fixed_question': Function;
        'message': Function;
        'static': Function;
    };
}

interface History {
    view: string;
    url: string;
}

declare module "BobjollPath/library/storage" {
    interface ClientStorage {
        get(namespace: 'feedback-history', key: string): string[];
        set(namespace: 'feedback-history', key: string, value: string[]): void;

        get(namespace: 'feedback-counter', key: string): number;
        set(namespace: 'feedback-counter', key: string, value: number): void;
    }
}

export default class Feedback extends KEventTarget {
    private view: string | undefined;
    private fixed: HTMLElement | undefined;
    private history: History[];
    private historyNS: string = 'feedback-history';
    private historyKey: string = 'history';
    private counterNS: string = 'feedback-counter';
    private settings: Settings;
    private defaultSettings: DefaultSettings = {
        default: {
            defaults: true,
            history: false,
            historyMax: 10,
        },
        templates: {
            'fixed': require('BobjollPath/templates/feedback-v1.0/fixed.hbs'),
            'fixed_question': require('BobjollPath/templates/feedback-v1.0/fixed-question.hbs'),
            'message': require('BobjollPath/templates/feedback-v1.0/message.hbs'),
            'static': require('BobjollPath/templates/feedback-v1.0/static.hbs'),
        }
    };
    
    constructor(settings: UserSettings) {
        super();
        
        this.settings = extend(this.defaultSettings, settings);

        if (this.settings.default.view) {
            this.view = this.settings.default.view;
        }

        if (this.settings.default.overlay) {
            this.addEventListener('feedback:view', () => {
                let question = this.get();

                if (question) {
                    if ('undefined' === typeof this.fixed) {
                        this.setup();
                    }
                } else {
                    this.destroy();
                }
            });
        }
    }

    private browser() {
        var N = navigator.appName;
        var UA = navigator.userAgent;
        var temp;
        var browserVersion = UA.match(/(opera|chrome|safari|firefox|msie|maxthon|lunascape)\/?\s*(\.?\d+(\.\d+)*)/i);

        if (browserVersion && (temp = UA.match(/version\/([\.\d]+)/i)) != null) {
            browserVersion[2] = temp[1];
        }
        
        if (browserVersion && browserVersion[1] && browserVersion[2]) {
            return {
                name: browserVersion[1],
                version: browserVersion[2],
            };
        }
    }

    private setup() {
        document.body.insertAdjacentHTML('beforeend', this.settings.templates.fixed());

        let feedback = document.getElementById('feedback');

        if (feedback) {
            let trigger = <HTMLButtonElement>feedback.querySelector('.feedback__trigger');

            this.fixed = feedback;

            if (trigger) {
                trigger.addEventListener('click', () => this.show());

                if (!this.settings.default.viewCounter) {
                    this.fixed.addEventListener('mouseup', (e: Event) => {
                        let target: EventTarget = e.target;
    
                        if (target === this.fixed) {
                            this.hide();
                        }
                    });
                } else {
                    this.fixed.classList.add('feedback--pointer-events');
                }
            }
        }
    }    

    private form(form: HTMLFormElement, id?: string) {
        let submit = form.querySelector('.button[type="submit"]');
        let reset = form.querySelector('.button[type="reset"]');

        if (submit) {
            submit.addEventListener('click', async (e: Event) => {
                e.preventDefault();

                if (form.checkValidity()) {
                    try {
                        let request = await this.submit(form, id);

                        if (submit) {
                            form.classList.add('disabled');
                            submit.classList.add('button--loading');
                        }
                    } catch (err) {
                        this.message(form, 'error');

                        if (Raven) {
                            Raven.captureException(err);
                        }
                    } finally {
                        if (submit) {
                            form.classList.remove('disabled');
                            submit.classList.remove('button--loading');
                        }
                    }
                } else {
                    this.checkValidity(form);
                }
            });
        }

        if (reset) {
            reset.addEventListener('click', (e: Event) => this.hide());
        }
    }

    private get(id?: string) {
        let questions = this.settings.questions;

        if (id) {
            questions = questions.filter((question) => {
                return id === question.id;
            });
        }

        if (this.view) {
            questions = questions.filter((question) => {
                return question.views && question.views.indexOf(this.view || '') >= 0;
            });
        } else {
            questions = questions.filter((question) => {
                return !question.views;
            });
        }

        let result = questions[Math.floor((Math.random() * questions.length))];

        if (this.settings.default.defaults && !result) {
            let questions = this.settings.questions;

            questions = questions.filter((question) => {
                return !question.views;
            });

            result = questions[Math.floor((Math.random() * questions.length))];
        }

        if (result) {
            if (!result.id) {
                result.id = this.settings.questions.reduce((acc: string, question, index: number) => {
                    if (result === question) {
                        acc = index.toString();
                    }
    
                    return acc;
                }, '0');
            }
    
            if (!result.options) {
                result.options = this.settings.default.options;
            }
    
            return result;
        }

        return null;
    }

    private checkValidity(form: HTMLFormElement) {
        let fields: HTMLInputElement[] = Array.prototype.slice.call(form.querySelectorAll('input, textarea'));

        fields.forEach((field) => {
            if (field.required && !field.validity.valid) {
                let errorField = form.querySelector(`.error.error-${field.name}`);

                if (!errorField) {
                    errorField = document.createElement('div');

                    errorField.classList.add('error', 'error-msg', `error-${field.name}`);

                    if (errorField) {
                        field.addEventListener('keyup', () => {
                            if (errorField) {
                                if (field.validity.valid) {
                                    let errorParent = errorField.parentElement;

                                    if (errorParent && errorField) {
                                        errorParent.removeChild(errorField);
                                    }

                                    field.classList.remove('error');
                                } else {
                                    errorField.innerHTML = `
                                        <div class="mg-none font-xs">
                                            <i class="icon icon--md icon--exclamation inline-block v-alignc"></i>
                                            <span>${field.validationMessage}</span>
                                        </div>
                                    `;
                                }
                            }
                        });
                    }
                }
                
                errorField.innerHTML = `
                    <div class="mg-none font-xs">
                        <i class="icon icon--md icon--exclamation inline-block v-alignc"></i>
                        <span>${field.validationMessage}</span>
                    </div>
                `;

                field.classList.add('error');
                field.insertAdjacentElement('afterend', errorField);
            }
        });
    }

    private async submit(form: HTMLFormElement, id?: string) {
        let data = new FormData(form);
        let questionID = <number | null>Number(form.dataset.questionId);
        let optionID = <number | null>Number(form.dataset.optionId);

        if (data && 'number' === typeof questionID && 'number' === typeof optionID) {
            let question = this.settings.questions[questionID];
            let option = question.options ? question.options[optionID] : this.settings.default.options[optionID];

            try {
                if (id) {
                    data.append('id', id);
                } else {
                    let browser = this.browser();

                    data.append('question', question!.question);
                    data.append('option', option!.value);

                    data.delete('email');
                    data.delete('message');

                    if (browser) {
                        data.append('browser_name', browser.name);
                        data.append('browser_version', browser.version);
                    }

                    if (this.settings.user) {
                        let user = this.settings.user();

                        if (user) {
                            if (user.id) {
                                data.append('user_id', user.id.toString());
                            }

                            if (user.premium) {
                                data.append('user_premium', user.premium.toString());
                            }
                        }
                    }

                    if (this.settings.default.history) {
                        data.append('history', JSON.stringify(
                            storage.get(this.historyNS, this.historyKey))
                        );
                    }
                }

                let request = await fetch(this.settings.action, {
                    body: data,
                    method: this.settings.method
                });
                let response = await request.json();

                if (id) {                    
                    let msg = option.success_msg || this.settings.default.success_msg;

                    if (response.success) {
                        if (msg) {
                            form.classList.add('hide');

                            this.message(form, 'success', msg);
                        } else {
                            this.hide();
                        }
                    }
                }

                if (!response.success) {
                    throw Error(response.message);
                }

                return response;
            } catch(err) {
                throw err;
            }
        }
    }

    private show() {
        if (this.fixed) {
            let wrapper = <HTMLElement>this.fixed.querySelector('.feedback__wrapper');
    
            if (wrapper) {
                if (!this.fixed.classList.contains('active')) {
                    let question = this.get();
                    let params: {
                        text: UserSettings['text'];
                        userEmail?: string;
                    } = {
                        text: this.settings.text
                    }

                    if (this.settings.user) {
                        let user = this.settings.user();

                        if (user && user.email) {
                            params.userEmail = user.email;
                        }
                    }
    
                    if (!question) {
                        return;
                    }
    
                    if (question.id) {
                        wrapper.id = question.id;
                    }
    
                    if (question.class) {
                        wrapper.classList.add(question.class);
                    }
    
                    wrapper.innerHTML = this.settings.templates.fixed_question(extend(question, params));
                    
                    Array.prototype.slice.call(this.fixed.getElementsByClassName('feedback__submit')).forEach((button: HTMLButtonElement) => 
                        button.addEventListener('click', async (e: Event) => {
                            if (this.fixed) {
                                let form = <HTMLFormElement>this.fixed.querySelector(`#form-${button.dataset.question}`);

                                if (form) {
                                    if (button.classList.contains('feedback__submit--staged')) {
                                        try {
                                            let response = await this.submit(form);
                                            let id = response && response.data && response.data.id ? response.data.id : null;

                                            this.form(form, id);
                                        } catch(err) {
                                            this.message(form, 'error');

                                            if (Raven) {
                                                Raven.captureException(err);
                                            }
                                        }
                                    } else {
                                        this.form(form);
                                    }
                                }
                            }
                        })
                    );
                }
        
                this.fixed.classList.toggle('active');
            }
        }
    }

    private hide() {
        if (this.fixed) {
            let wrapper = <HTMLElement>this.fixed.querySelector('.feedback__wrapper');

            this.fixed.classList.remove('active');

            setTimeout(() => {
                wrapper.innerHTML = '';
            }, parseFloat(Settings['feedback-duration']))
        }
    }

    private message(form: HTMLFormElement, status: 'success' | 'error' = 'success', msg?: string) {
        let settings;

        if ('error' === status) {
            settings = {
                status: status,
                icon: 'cross',
                message: msg || this.settings.text.request_error,
            }
        } else {
            settings = {
                status: status,
                icon: 'check',
                message: msg || this.settings.default.success_msg,
            }
        }
        
        form.insertAdjacentHTML('afterend', 
            this.settings.templates.message(extend(settings, {
                text: this.settings.text
            })
        ));

        let buttonClose = form!.parentElement!.querySelector('.feedback__close');

        if (buttonClose) {
            buttonClose.addEventListener('click', () => this.hide());
        }

        form.parentElement!.removeChild(form);
    }

    public insert(id: string) {

    }

    public updateView(view: string, url?: string) {
        this.view = view || undefined;

        if (this.settings.default.history && view) {
            let history: string[] = storage.get(this.historyNS, this.historyKey) || [];

            history.unshift(
                btoa(JSON.stringify({
                    view: view,
                    url: url || window.location.href,
                }))
            );

            if (history.length > this.settings.default.historyMax) {
                history.pop();
            }

            storage.set(this.historyNS, this.historyKey, history);

            if (this.settings.default.viewCounter) {
                let counterSettings = this.settings.default.viewCounter.filter((settings) => {
                    return settings.view === view || !settings.view;
                }).pop();

                if (counterSettings) {
                    let counter = storage.get(this.counterNS, (counterSettings.view || 'all')) || 0;

                    if ('undefined' !== typeof counter && (!counterSettings.times || counter < (counterSettings.times * this.settings.default.historyMax))) {
                        counter++;
    
                        storage.set(this.counterNS, (counterSettings.view || 'all'), counter);
    
                        if (0 === counter % counterSettings['%'] && this.fixed && !this.fixed.classList.contains('active')) {
                            this.show();
                        }
                    }
                }
            }
        }

        this.dispatchEvent(new KEventView(view));
    }

    public destroy() {
        if (this.fixed) {
            this.fixed.parentNode!.removeChild(this.fixed);
            this.fixed = undefined;
        }
    }
}