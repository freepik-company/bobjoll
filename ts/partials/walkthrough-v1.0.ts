import { q, qq } from 'bobjoll/ts/library/dom';
import { Cookie as cookie } from 'bobjoll/ts/library/cookie';

export class Walkthrough {
    private static readonly template = require('BobjollTemplate/walkthrough-v1.0/walkthrough.hbs');
    private static readonly templateContent = require('BobjollTemplate/walkthrough-v1.0/walkthrough-notification.hbs');
    private static wrapperElement: HTMLElement | null;
    private static sheet: HTMLStyleElement;

    public static add(settings: WalkthroughSettings) {
        Walkthrough.setup(settings.id);

        if (!cookie.getItem(`walkthrough-${settings.id}`)) {
            if (Walkthrough.wrapperElement) {
                const position = this.getPositionElement(settings);
                if (position) this.setStyle(settings, position);

                Walkthrough.wrapperElement.innerHTML = this.templateContent({ html: settings.html });
                Walkthrough.wrapperElement.classList.add('active');

                setTimeout(() => window.scrollTo(0, 0), 250);

                qq('.notification__close', Walkthrough.wrapperElement).forEach(buttonElement =>
                    buttonElement.addEventListener('click', () => {
                        cookie.setItem(`walkthrough-${settings.id}`, '1');
                        Walkthrough.wrapperElement!.classList.remove('active');
                        document.body.style.overflow = '';
                    }),
                );
            }
        }      
    }

    private static setup(id: string) {
        if (!Walkthrough.wrapperElement) {
            document.body.insertAdjacentHTML('beforeend', Walkthrough.template({id}));
            Walkthrough.wrapperElement = q(`.walkthrough__${id}`);
        }
    }

    private static getPositionElement(settings: WalkthroughSettings) {
        const element = q(settings.elementToWalk);
        if (!element) return;

        const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        return {
            right: screenWidth - element.getBoundingClientRect().right,
            top: element.getBoundingClientRect().top,
        }
    }

    private static setStyle(settings: WalkthroughSettings, pos: { top: number; right: number } ) {
        Walkthrough.sheet = document.createElement('style');

        this.setPositionWalkthrough(settings.id, pos);

        if (settings.setStyle) Walkthrough.setStyleNotification(settings);

        document.body.style.overflow = 'hidden';
        document.body.appendChild(Walkthrough.sheet);
    }

    private static setPositionWalkthrough(id: string, pos: { top: number; right: number }) {
        Walkthrough.sheet.innerHTML = `.walkthrough__${id}::before{top:${pos.top}px !important;right:${pos.right}px !important;transform:translate(124px, -182px) !important}`;
        Walkthrough.sheet.innerHTML += `.walkthrough__${id} .walkthrough__notification--content{top:${pos.top}px !important;right:${pos.right}px !important}`;
    }

    private static setStyleNotification(settings: WalkthroughSettings) {
        if (!settings.setStyle) return;

        Object.entries(settings.setStyle).forEach(([element, style]) => {
            const newStyle = Object.keys(style).map(prop => `${prop}:${style[prop]}`).join(';');
            Walkthrough.sheet.innerHTML += `.walkthrough__${settings.id} ${element} { ${newStyle} } `;
        });
    }
}

export interface WalkthroughSettings {
    elementToWalk: string;
    html: string;
    id: string;
    setStyle?: { [name: string]: any };
}
