import View from 'BobjollView';
import { q, qq, delegate } from 'Bobjoll/ts/library/dom';
import autocompleteV10 from 'Bobjoll/ts/partials/autocomplete-v1.0';
import { KEvent, KEventTarget } from 'Bobjoll/ts/library/event';

// tslint:disable-next-line:no-var-requires
const extend = require('Bobjoll/ts/library/extend');

export class KEventChange extends KEvent {
    constructor(tag: string, tags: string[]) {
        super();

        this.type = 'change';
        this.extra = {
            tag: tag,
            tags: tags,
        };
    }
}

type TReturnType = {
    text: string;
    value: string;
}[];
type TSourceMethod = (query: string) => Promise<TReturnType>;

interface Settings {
    selector: HTMLElement;
    input: HTMLInputElement;
    source: TSourceMethod;
    templates: {
        field: Function;
        tag: Function;
    };
}

interface CustomSettings {
    selector?: HTMLElement;
    input?: HTMLInputElement;
    source: TSourceMethod;
    templates?: {
        field?: Function;
        tag?: Function;
    };
}

export class TagsField extends KEventTarget {
    private items: HTMLElement | null = null;
    private input: HTMLInputElement | null = null;
    private content: HTMLElement | null = null;
    private settings: Settings;
    private autocomplete: autocompleteV10 | null = null;
    private settingsDefault = {
        input: q('.tag-field input') as HTMLInputElement,
        selector: q('.tag-field')!,
        templates: {
            field: require(`BobjollTemplate/tags-v1.0/wrapper.${View.ext}`),
            tag: require(`BobjollTemplate/tags-v1.0/element.${View.ext}`),
        }
    };

    constructor(settings: CustomSettings) {
        super();
        this.settings = extend(this.settingsDefault, settings);
        this.render();
    }

    public addEventListener(t: 'change', listener: (ev: KEvent) => any, useCapture?: boolean): void;
    // tslint:disable-next-line:no-unnecessary-override
    public addEventListener(t: string, listener: (ev: KEvent) => any, useCapture: boolean = true): void {
        super.addEventListener(t, listener, useCapture);
    }

    private add(value: string) {
        if (0 < value.length) {
            if (this.input) {
                this.input.value = '';
                this.input.insertAdjacentHTML('beforebegin', View.render(this.settings.templates.tag, {
                    value: value
                }));
            }
            this.update();
            this.dispatchEvent(new KEventChange(value, this.settings.input.value.split(',')));
        }
    }

    private update() {
        const tags: string[] = qq('.tag-field__item').reduce((acc: string[], tag) => {
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
            source: this.settings.source
        });

        this.settings.selector.addEventListener('click', () => this.input!.focus());
        this.input.addEventListener('change', () => this.add(this.input!.value));
        this.input.addEventListener('keydown', (e: any) => {
            const key = window.event ? e.keyCode : e.which;

            if (0 === this.input!.value.length && 8 === key) { //return
                const lastItem = qq('.tag-field__item').pop();

                if (lastItem) {
                    if (this.items) {
                        this.items.removeChild(lastItem);
                    }
                    this.update();
                }
            }
        });

        this.input.addEventListener('keyup', async (e: any) => {
            const key = window.event ? e.keyCode : e.which;

            if (13 === key || 9 === key) { //enter
                await new Promise((resolve) => setTimeout(resolve, 100));

                this.add(this.input!.value);
            }

            if (this.content) {
                this.content.innerText = this.input!.value;
                this.input!.style.width = `${this.content.getBoundingClientRect().width + 20}px`;
            }
        });

        const removeHandler = function(this: HTMLElement) {
            const item = this.parentElement;

            if (item) {
                if (self.items) {
                    self.items.removeChild(item);
                }
                self.update();
            }
        };
        if (this.items) {
            delegate('.remove', 'click', removeHandler, this.items);
        }
        return null;
    }
}
