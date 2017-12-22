import { KEvent, KEventTarget } from 'BobjollPath/library/event';

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
                label?: string;
                required?: boolean;
                placeholder: string;
            };
            success_msg?: string;
            text?: string;
            value: string;
        }[];
        success_msg?: string;
        view?: string;
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
    email?: string | FunctionStringCallback;
}

interface Settings extends UserSettings {
    templates: {
        'fixed': Function;
        'fixed_question': Function;
        'message': Function;
        'static': Function;
    };
}

export default class Feedback extends KEventTarget {
    private view: string | undefined;
    private fixed: HTMLElement | undefined;
    private settings: Settings;
    private defaultSettings: DefaultSettings = {
        default: {
            defaults: true
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

            this.dispatchEvent(new KEventView(this.settings.default.view));
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

    private setup() {
        document.body.insertAdjacentHTML('beforeend', this.settings.templates.fixed());

        let feedback = document.getElementById('feedback');

        if (feedback) {
            let trigger = <HTMLButtonElement>feedback.querySelector('.feedback__trigger');

            this.fixed = feedback;

            if (trigger) {
                trigger.addEventListener('click', () => this.show());

                this.fixed.addEventListener('mouseup', (e: Event) => {
                    let target: EventTarget = e.target;

                    if (target === this.fixed) {
                        this.hide();
                    }
                });
            }
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

    private async submit(form: HTMLFormElement) {
        let data = new FormData(form);

        if (data) {           
            try {
                let questionID = <number | null>data.get('question_id');
                let optionID = <number | null>data.get('option_id');

                if (questionID && optionID) {
                    let question = this.settings.questions[questionID];
                    let option = question.options ? question.options[optionID] : this.settings.default.options[optionID];
                    let msg = option.success_msg || this.settings.default.success_msg;

                    let request = await fetch(this.settings.action, {
                        body: data,
                        method: this.settings.method
                    });
                    let response = await request.json();

                    if (response.success) {
                        if (msg) {
                            form.classList.add('hide');
                            form.insertAdjacentHTML('afterend', this.settings.templates.message({
                                status: 'success',
                                message: msg,
                            }));
                        } else {
                            this.hide();
                        }
                    }
                } else {
                    throw Error("Couldn't find question.");
                }
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
    
                    if (!question) {
                        return;
                    }
    
                    if (question.id) {
                        wrapper.id = question.id;
                    }
    
                    if (question.class) {
                        wrapper.classList.add(question.class);
                    }
    
                    wrapper.innerHTML = this.settings.templates.fixed_question(extend(question, {
                        text: this.settings.text,
                        email: this.settings.email || '',
                    }));
    
                    let forms: HTMLFormElement[] = Array.prototype.slice.call(this.fixed.querySelectorAll('form'));
    
                    forms.forEach((form) => {
                        let submit = form.querySelector('.button[type="submit"]');
                        let reset = form.querySelector('.button[type="reset"]');
    
                        if (submit) {
                            submit.addEventListener('click', async (e: Event) => {
                                e.preventDefault();
        
                                if (form.checkValidity()) {
                                    try {
                                        let request = await this.submit(form);
        
                                        if (submit) {
                                            form.classList.add('disabled');
                                            submit.classList.add('button--loading');
                                        }
                                    } catch(err) {
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
                    });                
                } else {
                    wrapper.innerHTML = '';
                }
        
                this.fixed.classList.toggle('active');
            }
        }
    }

    private hide() {
        if (this.fixed) {
            let wrapper = <HTMLElement>this.fixed.querySelector('.feedback__wrapper');
    
            if (wrapper) {
                wrapper.innerHTML = '';
            }

            this.fixed.classList.remove('active');
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

    public updateView(view ?: string) {
        this.view = view || undefined;

        if ('undefined' !== typeof this.fixed) {
            this.fixed.classList.remove('active');
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