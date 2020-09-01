import { delegate, qq } from "../library/delegate";

const getActiveIndex = (parent: HTMLElement): number => {
    return qq('header li', parent).reduce((acc, link, index) => 
        ((acc = link.classList.contains('active') ? index : acc), acc), 
        0
    );
}

const showActiveTab = (parent: HTMLElement) => {
    const index = getActiveIndex(parent);
    qq('header ~ .content', parent).forEach((element, i) => 
        element.classList[i === index ? 'add' : 'remove']('show')
    );
    window.dispatchEvent(new Event('resize'));
}

const handlerHeaderLink = function(this: HTMLElement) {
    const accordionTabElement = this.parent('.accordion-tabs') as HTMLElement|undefined;
    if (accordionTabElement) {
        qq('header li.active', accordionTabElement).forEach(element => element.classList.remove('active'));
        this.classList.add('active');
        showActiveTab(accordionTabElement);
    }
}

delegate('.accordion-tabs header li', 'click', handlerHeaderLink);