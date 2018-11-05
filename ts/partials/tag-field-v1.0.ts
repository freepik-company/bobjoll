import View from 'BobjollView';
import { q, qq, delegate } from 'bobjoll/ts/library/dom';
import autocompleteV10, { KEventAdd, KEventSource } from 'bobjoll/ts/partials/autocomplete-v1.0';
import { KEvent, KEventTarget } from 'bobjoll/ts/library/event';

// tslint:disable-next-line:no-var-requires
const EXT = View.ext;
export class TagsField extends KEventTarget {
    private items: HTMLElement | null = null;
    private input: HTMLInputElement;
    private content: HTMLElement | null = null;
    private settings: Settings;
    private autocomplete: autocompleteV10 | null = null;

    constructor(settings: CustomSettings) {
        super();

        if (settings.selector) {
            const input = (q('input', settings.selector) as HTMLInputElement);
            const field = require(`BobjollTemplate/tags-v1.0/wrapper.${EXT}`);
            const tag = require(`BobjollTemplate/tags-v1.0/element.${EXT}`);

            if (input) {
                this.settings = {
                    allowDuplicates: true,
                    lowercase: false,
                    selector: q('.tag-field')!,
                    sourceOnly: false,
                    sourceMessage: '',
                    input: input,
                    templates: {
                        field: field,
                        tag: tag,
                    },
                    ...settings,
                };
                this.input = input;

                this.render();
            } else {
                console.error(`TagField couldn't be initialized due to missing input element.`);    
            }
        } else {
            console.error(`TagField couldn't be initialized due to missing wrapper element.`);
        }
    }

    public addEventListener(t: 'change', listener: (ev: KEvent) => any, useCapture?: boolean): void;
    // tslint:disable-next-line:no-unnecessary-override
    public addEventListener(t: string, listener: (ev: KEvent) => any, useCapture: boolean = true): void {
        super.addEventListener(t, listener, useCapture);
    }

    public addItems(arr: string[]) {
        arr.forEach(value => this.add(value));
    }

    public removeItems(arr: string[]) {
        let valuesRemoved: string[] = [];
        let value: string | string[] = '';
        qq('.tag-field__item', this.settings.selector).forEach(item => {
            if (arr.indexOf(item.innerText.trim()) >= 0 && item.parentElement) {
                const value = item.dataset.value;
                item.parentElement.removeChild(item);
                if (value) {
                    valuesRemoved.push(value);
                }
            }
        });
        if (1 === valuesRemoved.length) {
            value = valuesRemoved.pop() || '';
        }
        this.update();
        this.dispatchEvent(new KEventChange(value, this.settings.input.value.split(',').filter(value => '' !== value), 'remove' ) );
    }

    public getItems(lowercase: boolean = false): string[] {
        return this.settings.input.value.split(',').reduce((acc, value) => {
            if (lowercase) {
                value = value.toLocaleLowerCase();
            }

            value = value.trim();

            if ('' !== value) {
                acc.push(value);
            }

            return acc;
        }, <string[]>[]);
    }

    public clear() {
        const values = this.getItems();
        this.removeItems(values);
    }

    private add(value: string) {
        const values = this.getItems(true);
        const val = value.trim().toLowerCase();

        if (0 < value.length) {
            value = value.trim();

            if (this.settings.lowercase) {
                value = value.toLowerCase();
            }

            if (this.input) {
                this.input.value = '';

                if ((!this.settings.allowDuplicates && (-1) === values.indexOf(val)) || this.settings.allowDuplicates) {
                    this.input.insertAdjacentHTML('beforebegin', View.render(this.settings.templates.tag, {
                        value: value
                    }));

                    this.update();
                    this.dispatchEvent(new KEventChange(value, this.settings.input.value.split(',').filter(value => '' !== value)));
                }
            }
        }
    }

    private update() {
        const tags: string[] = qq('.tag-field__item', this.settings.selector).reduce((acc: string[], tag) => {
            acc.push(tag.innerText.trim());

            return acc;
        }, []);

        if (this.input) {
            this.input.removeAttribute('style');
        }
        if (this.content) {
            this.content.innerText = '';
        }
        if (this.autocomplete) {
            this.autocomplete.hide();
        }

        this.settings.input.value = tags.join(',');
    }

    private render() {
        const tags = this.settings.input.value.split(',').reduce((acc: {value: string; }[], value: string) => {
            value = value.trim();

            if ('' !== value) {
                acc.push({
                    value: value
                });
            }

            return acc;
        }, []);
        const options: { tags?: {value: string}[] } = {};

        if (0 < tags.length) {
            options.tags = tags;
        }

        this.settings.selector.insertAdjacentHTML('beforeend', View.render(this.settings.templates.field, options));

        const items = <HTMLElement>this.settings.selector.querySelector('.tag-field__items');

        if (items) {
            const input = <HTMLInputElement>items.querySelector('.tag-field__input');
            const content = <HTMLElement>this.settings.selector.querySelector('.tag-field__content span');

            this.items = items;

            if (input && content) {
                this.input = input;
                this.content = content;

                this.addEventListeners();
            }
        }
    }

    private addEventListeners() {
        // tslint:disable-next-line:no-var-self
        const self = this;

        if (!this.input) {
            return null;
        }

        this.autocomplete = new autocompleteV10({
            fields: this.input,
            source: this.settings.source,
            sourceMessage: this.settings.sourceMessage
        });

        this.settings.selector.addEventListener('click', () => this.input.focus());

        if (this.settings.sourceOnly) {
            this.autocomplete.addEventListener('add', (event) => this.eventHandlerAutocompleteAdd(event));
            this.autocomplete.addEventListener('source', (event) => this.eventHandlerAutocompleteSource(event));
        } else {
            this.input.addEventListener('change', () => this.eventHandlerInputChange());
            this.input.addEventListener('keydown', (event) => this.eventHandlerInputKeyDown(event));
            this.input.addEventListener('keyup', (event) => this.eventHandlerInputKeyUp(event));
        }

        this.input.addEventListener('keyup', () => {
            if (this.content) {
                this.content.innerText = this.input!.value;
                this.input!.style.width = `${this.content.getBoundingClientRect().width + 20}px`;
            }
        }); 

        const removeHandler = function(this: HTMLElement) {
            const item = <HTMLElement | undefined>this.parent('.tag-field__item');
            if (item) {
                self.removeItems([item.dataset.value || '']);
            }
        };

        if (this.items) {
            delegate('.remove', 'click', removeHandler, this.items);
        }

        return null;
    }

    private eventHandlerAutocompleteAdd(event: KEventAdd) {
        this.add(event.extra.item);
    }

    private eventHandlerAutocompleteSource(event: KEventSource) {
        
    }

    private eventHandlerInputChange() {
        this.add(this.input.value);
    }

    private eventHandlerInputKeyDown(event: KeyboardEvent) {
        const key = window.event ? event.keyCode : event.which;

        if (0 === this.input.value.length && 8 === key) { //return
            const lastItem = qq('.tag-field__item', this.settings.selector).pop();

            if (lastItem) {
                if (this.items) {
                    this.items.removeChild(lastItem);
                }
                this.update();
            }
        }
    }

    private async eventHandlerInputKeyUp(event: KeyboardEvent) {
        const key = window.event ? event.keyCode : event.which;

        if (13 === key || 9 === key) { //enter
            await new Promise((resolve) => setTimeout(resolve, 100));

            this.add(this.input.value);
        }
    }
}

export class KEventChange extends KEvent {
    constructor(tag: string | string[], tags: string[], action: ('add' | 'remove') = 'add') {
        super();

        this.type = 'change';
        this.extra = {
            tag: Array.isArray(tag) ? (1 == tag.length ? tag[0] : tag) : tag,
            tags: tags,
            action: action,
        };
    }
}

type TReturnType = {
    text: string;
    value: string;
}[];
type TSourceMethod = (query: string) => Promise<TReturnType>;

interface Settings {
    allowDuplicates: boolean;
    selector: HTMLElement;
    input: HTMLInputElement;
    source: TSourceMethod;
    sourceOnly: boolean;
    sourceMessage: string;
    lowercase: boolean;
    templates: {
        field: Function;
        tag: Function;
    };
}

interface CustomSettings {
    allowDuplicates?: boolean;
    selector?: HTMLElement;
    lowercase?: boolean;
    source: TSourceMethod;
    sourceOnly?: boolean;
    sourceMessage?: string;
    templates?: {
        field?: Function;
        tag?: Function;
    };
}