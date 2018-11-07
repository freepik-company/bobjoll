import { clearTimeout } from 'timers';
import { KEvent, KEventTarget } from 'bobjoll/ts/library/event';
import { qq } from '../library/dom';
import View from 'BobjollView';

// tslint:disable-next-line:no-var-requires
const EXT = View.ext;

type AutocompleteSourceFunction = (query: string) => { [name: string]: any; };

interface AutocompleteInputElement extends HTMLInputElement {
    timer: any;
    keydownHandler: EventListener;
    keyupHandler: EventListener;
    focusHandler: EventListener;
    blurHandler: EventListener;
    container: HTMLElement;
    results: HTMLElement[];
}

interface AutocompleteOptions {
    delay?: number;
    fields: HTMLInputElement | NodeListOf<HTMLInputElement>;
    minChars?: number;
    source: string[] | AutocompleteSourceFunction;
    sourceMessage?: string;
    templateList?: Function;
    templateWrapper?: Function;
}

interface AutocompleteSettings {
    delay: number;
    fields: HTMLInputElement | NodeListOf<HTMLInputElement>;
    minChars: number;
    source: string[] | AutocompleteSourceFunction;
    sourceMessage: string;
    templateList: Function;
    templateWrapper: Function;
}

export class KEventSource extends KEvent {
    constructor(source: { [name: string]: any; } | undefined) {
        super();
        this.type = 'source';
        this.extra = {
            source: source,
        };
    }
}

export class KEventAdd extends KEvent {
    constructor(string: string) {
        super();
        this.type = 'add';
        this.extra = {
            item: string,
        };
    }
}

// tslint:disable-next-line:export-name
// tslint:disable-next-line:no-default-export
export default class Autocomplete extends KEventTarget {
    private cancelled = false;
    private index: number = -1;
    private cache: { query: string, value: any; }[] = [];
    private value: string = '';
    private timeout: any;
    private fields: AutocompleteInputElement[];
    private settings: AutocompleteSettings;

    constructor(options: AutocompleteOptions) {
        super();
        this.settings = {
            delay: 400,
            minChars: 0,
            sourceMessage: '',
            templateWrapper: require(`BobjollTemplate/autocomplete-v1.0/wrapper.${EXT}`),
            templateList: require(`BobjollTemplate/autocomplete-v1.0/container.${EXT}`),
            ...options,
        };

        if (/^\[object (HTMLCollection|NodeList|Object)\]$/.
            test(Object.prototype.toString.call(this.settings.fields))) {
            this.fields = Array.prototype.slice.call(this.settings.fields);
        } else {
            this.fields = [<AutocompleteInputElement>this.settings.fields];
        }

        this.init();
    }

    public hide() {
        clearTimeout(this.timeout);

        this.fields.forEach((field) => {
            delete field.results;

            field.container.innerHTML = '';
            field.container.classList.remove('autocomplete--show');
        });
    }

    private init() {
        this.render();
        this.addEventListeners();
    }

    private render() {
        this.fields.forEach((field) => {
            field.insertAdjacentHTML('afterend', View.render(this.settings.templateWrapper));

            field.parentElement!.style.position = 'relative';

            field.container = <HTMLElement>field.nextSibling;
            field.container.style.top = '100%';
            field.container.style.left = '0';
        });
    }

    // tslint:disable-next-line:max-func-body-length
    private addEventListeners() {
        // tslint:disable-next-line:no-var-self
        const self = this;

        // tslint:disable-next-line:max-func-body-length
        this.fields.forEach((field) => {
            /**
             * Keydown handler
             */
            // tslint:disable-next-line:no-function-expression
            field.keydownHandler = (function(e: KeyboardEvent) {
                const key = window.event ? e.keyCode : e.which;

                if ((38 === key || 40 === key) && self.index < field.results.length) {
                    e.preventDefault();

                    if (field.results[self.index]) {
                        field.results[self.index].classList.remove('selected');
                    }

                    if (40 === key) { //down
                        self.index++;
                    }

                    if (38 === key) { //up
                        self.index--;
                    }

                    if (field.results.length <= self.index) {
                        self.index = 0;
                    }

                    if (0 > self.index) {
                        self.index = (field.results.length - 1);
                    }

                    if (field.results[self.index]) {
                        field.results[self.index].classList.add('selected');
                    }
                }

                if (27 === key) { //esc
                    self.cancelled = true;

                    self.hide();
                }

                if (13 === key || 9 === key) { //enter
                    e.preventDefault();
                    
                    setTimeout(() => {
                        const selected = field.results ? (field.results[self.index] || undefined) : undefined;

                        if (selected) {
                            const value = selected.dataset.value;

                            if (value) {
                                field.value = self.value = value;
                                field.dispatchEvent(new Event('change'));
                                self.dispatchEvent(new KEventAdd(field.value));
                            }
                        }

                        if ('' === self.settings.sourceMessage) {
                            self.cancelled = true;
                            self.hide();
                        }
                    }, 50);
                }
            }) as EventListener;

            /**
             * Keyup handler
             */
            field.keyupHandler = (function(this: AutocompleteInputElement, e: KeyboardEvent) {
                if (this.value !== self.value) {
                    self.cancelled = false;

                    const key = window.event ? e.keyCode : e.which;

                    self.hide();

                    if (!key || (key < 35 || key > 40) && key !== 13 && key !== 27) {
                        const value = self.value = this.value;

                        if (value.length >= self.settings.minChars) {
                            if ('number' === typeof this.timer) {
                                window.clearTimeout(this.timer);
                                delete this.timer;
                            }

                            this.timer = setTimeout(() => self.source(field, value), self.settings.delay);
                        }
                    }
                } else {
                    clearTimeout(self.timeout);
                }
            }) as EventListener;

            /**
             * Blur handler
             */
            field.blurHandler = (_e: Event) => {
                field.removeEventListener('keydown', field.keydownHandler);
                field.removeEventListener('keyup', field.keyupHandler);
                field.removeEventListener('blur', field.blurHandler);

                self.hide();
            };

            /**
             * Focus hanlder
             */
            field.focusHandler = (_e: Event) => {
                self.value = this.value;

                field.addEventListener('keydown', field.keydownHandler);
                field.addEventListener('keyup', field.keyupHandler);
                field.addEventListener('blur', field.blurHandler);
            };
            field.addEventListener('focusin', field.focusHandler);
        });

    }

    private async source(field: AutocompleteInputElement, query: string) {
        let source: { [name: string]: any; } | undefined;
        const cache = this.cache.filter((object) => { return query === object.query; }).pop();

        if (cache) {
            source = cache.value;
        } else {
            if ('function' === typeof this.settings.source) {
                source = await this.settings.source(query);
            }

            if (Array.isArray(this.settings.source)) {
                const re = new RegExp(query, 'i');

                source = this.settings.source.reduce((acc: { [name: string]: any; }, item: string) => {
                    if (item.match(re)) {
                        acc.keywords.text = item;
                    }

                    return acc;
                }, { keywords: {} });
            }
        }

        if (!this.cancelled) {
            if (!cache) {
                this.cache.unshift({query: query, value: source});
            }

            if (10 < this.cache.length) {
                this.cache.pop();
            }

            field.container.innerHTML = View.render(this.settings.templateList, {
                keywords: source,
                message: this.settings.sourceMessage,
            });

            this.index = -1;

            field.results = qq('.autocomplete__item');

            field.results.forEach((item) => {
                item.addEventListener('mousedown', () => {
                    field.value = this.value = item.dataset.value || item.innerText;

                    this.dispatchEvent(new KEventAdd(field.value));
                    field.dispatchEvent(new Event('change'));
                });
            });

            field.container.classList.add('autocomplete--show');
        } else if ('' === this.settings.sourceMessage) {
            field.container.classList.remove('autocomplete--show');
        }
    }
}
