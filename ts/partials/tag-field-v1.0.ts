import { q, qq, delegate, delegateRemove } from 'BobjollPath/library/dom';
import Autocomplete from 'BobjollPath/partials/autocomplete-v1.0';
import { KEvent, KEventTarget } from 'BobjollPath/library/event';

class KEventChange extends KEvent {
    type: string;

    constructor(tag: string, tags: string[]) {
        super();
        this.type = 'field:change'
    }
}

var extend = require('BobjollPath/library/extend');

interface Settings {
    selector: HTMLElement;
    input: HTMLInputElement;
    source: (query: string) => {text: string; value: string;} | string[]
    templates: {
        field: Function;
        tag: Function;
    }
}

interface CustomSettings {
    selector?: HTMLElement;
    input?: HTMLInputElement;
    source: (query: string) => {text: string; value: string;}[];
    templates?: {
        field?: Function;
        tag?: Function;
    }
}

export default class TagsField extends KEventTarget {
    private items: HTMLElement;
    private input: HTMLInputElement;
    private content: HTMLElement;
    private settings: Settings;
    private autocomplete: Autocomplete;    

    constructor(settings?: CustomSettings) {
        super();
        
        this.settings = extend({
            input: q('.tag-field input'),
            selector: q('.tag-field'),
            templates: {
                field: require('BobjollPath/templates/tags/field.hbs'),
                tag: require('BobjollPath/templates/tags/tag.hbs'),
            }
        }, settings);        
        
        this.render();        
    }

    private add(value: string) {
        if (0 < value.length) {
            this.input.value = '';

            this.input.insertAdjacentHTML('beforebegin', this.settings.templates.tag({
                value: value
            }));

            this.update();
        }
    }

    private update() {
        let tags: string[] = qq('.tag-field__item').reduce((acc: string[], tag) => {
            acc.push(tag.innerText.trim());

            return acc;
        }, []);
        
        this.input.removeAttribute('style');
        this.content.innerText = '';
        this.autocomplete.hide();
        this.settings.input.value = tags.join(',');
    }

    private render() {
        let tags = this.settings.input.value.split(',').reduce((acc: {value: string; }[], value: string) => {
            value = value.trim();

            if ('' !== value) {
                acc.push({
                    value: value
                });
            }

            return acc;
        }, []);
        let options: { tags?: {value: string}[] } = {};

        if (0 < tags.length) {
            options.tags = tags;
        }

        console.log(tags);

        this.settings.selector.insertAdjacentHTML('beforeend', this.settings.templates.field(options));

        let items = <HTMLElement>this.settings.selector.querySelector('.tag-field__items');

        if (items) {
            let input = <HTMLInputElement>items.querySelector('.tag-field__input');
            let content = <HTMLElement>this.settings.selector.querySelector('.tag-field__content span');

            this.items = items;

            if (input && content) {
                this.input = input;
                this.content = content;

                this.addEventListeners();
            }
        }
    }

    private addEventListeners() {
        let self = this;

        this.autocomplete = new Autocomplete({
            fields: this.input,
            source: this.settings.source
        });

        this.settings.selector.addEventListener('click', () => this.input.focus());

        this.input.addEventListener('keyup', (e: any) => {
            let key = window.event ? e.keyCode : e.which;

            if (13 === key || 9 === key) { //enter
                this.add(this.input.value);
            }

            if (0 === this.input.value.length && 8 === key) { //return
                let lastItem = qq('.tag-field__item').pop();

                if (lastItem) {
                    this.items.removeChild(lastItem);
                    this.update();
                }
            }

            this.content.innerText = this.input.value;

            this.input.style.width = `${this.content.getBoundingClientRect().width + 20}px`;
        });

        this.input.addEventListener('change', () => this.add(this.input.value));

        let removeHandler = function(this: HTMLElement, e: Event) {
            let item = this.parentElement;

            if (item) {
                self.items.removeChild(item);

                self.update();
            }
        }
        delegate('.remove', 'click', removeHandler, this.items);
    }

    addEventListener(type: 'field:change', listener: (ev: KEventChange) => any, useCapture?: boolean): void;
    addEventListener(type: string, listener: (ev: KEvent) => any, useCapture: boolean = true): void {
        super.addEventListener(type, listener, useCapture);
    }
}