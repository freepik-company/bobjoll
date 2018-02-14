import { q, qq, delegate } from 'BobjollPath/library/dom';
import autocompleteV10 from 'BobjollPath/partials/autocomplete-v1.0';
import { KEvent, KEventTarget } from 'BobjollPath/library/event';

// tslint:disable-next-line:no-var-requires
const extend = require('BobjollPath/library/extend');

export class KEventChange extends KEvent {
    public tag: string;
    public tags: string[];

    constructor(tag: string, tags: string[]) {
        super();
        this.tag = tag;
        this.tags = tags;
    }
}

type TSourceMethod = (query: string) => {
    text: string;
    value: string;
}[];

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
    private items: HTMLElement;
    private input: HTMLInputElement;
    private content: HTMLElement;
    private settings: Settings;
    private autocomplete: autocompleteV10;
    private settingsDefault = {
        input: q('.tag-field input') as HTMLInputElement,
        selector: q('.tag-field')!,
        templates: {
            field: require('BobjollPath/templates/tags/field.hbs'),
            tag: require('BobjollPath/templates/tags/tag.hbs'),
        }
    };

    constructor(settings: CustomSettings) {
        super();

        this.settings = extend(this.settingsDefault, settings);

        this.render();
    }

    private add(value: string) {
        if (0 < value.length) {
            this.input.value = '';

            this.input.insertAdjacentHTML('beforebegin', this.settings.templates.tag({
                value: value
            }));

            this.update();

            this.dispatchEvent(new KEventChange(value, this.settings.input.value.split(',')));
        }
    }

    private update() {
        const tags: string[] = qq('.tag-field__item').reduce((acc: string[], tag) => {
            acc.push(tag.innerText.trim());

            return acc;
        }, []);

        this.input.removeAttribute('style');
        this.content.innerText = '';
        this.autocomplete.hide();
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

        this.settings.selector.insertAdjacentHTML('beforeend', this.settings.templates.field(options));

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

        this.autocomplete = new autocompleteV10({
            fields: this.input,
            source: this.settings.source
        });

        this.settings.selector.addEventListener('click', () => this.input.focus());

        this.input.addEventListener('change', () => this.add(this.input.value));

        this.input.addEventListener('keydown', (e: any) => {
            const key = window.event ? e.keyCode : e.which;

            if (0 === this.input.value.length && 8 === key) { //return
                const lastItem = qq('.tag-field__item').pop();

                if (lastItem) {
                    this.items.removeChild(lastItem);
                    this.update();
                }
            }
        });

        this.input.addEventListener('keyup', async (e: any) => {
            const key = window.event ? e.keyCode : e.which;

            if (13 === key || 9 === key) { //enter
                await new Promise((resolve) => setTimeout(resolve, 100));

                this.add(this.input.value);
            }

            this.content.innerText = this.input.value;

            this.input.style.width = `${this.content.getBoundingClientRect().width + 20}px`;
        });

        const removeHandler = function(this: HTMLElement) {
            const item = this.parentElement;

            if (item) {
                self.items.removeChild(item);

                self.update();
            }
        };
        delegate('.remove', 'click', removeHandler, this.items);
    }
}
