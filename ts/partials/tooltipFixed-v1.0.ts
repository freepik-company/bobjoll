import { Cookie as cookie } from 'bobjoll/ts/library/cookie';
import { q, qq } from 'bobjoll/ts/library/dom';

export class TooltipFixed {
    private static readonly templateContent = require('BobjollTemplate/tooltipFixed-v1.0/tooltipFixed-notification.hbs');
    private static wrapperElement: HTMLElement | null;
    private static sheet: HTMLStyleElement;

    public static add(settings: TooltipFixedSettings) {
        TooltipFixed.wrapperElement = q(settings.element);

        if (!cookie.getItem(`tooltipFixed-${settings.id}`)) {
            if (TooltipFixed.wrapperElement) {
                if (!settings.tooltip) {
                    settings.tooltip = TooltipFixed.wrapperElement.innerHTML;
                }
                if (settings.setStyle) TooltipFixed.setStyle(settings);
                TooltipFixed.wrapperElement.innerHTML = this.templateContent({ html: settings.html });
                TooltipFixed.wrapperElement.classList.add('tooltipFixed__active');

                qq('.notification__close', TooltipFixed.wrapperElement).forEach((buttonElement) =>
                    buttonElement.addEventListener('click', () => {
                        cookie.setItem(`tooltipFixed-${settings.id}`, '1');
                        if (settings.tooltip) TooltipFixed.wrapperElement!.innerHTML = settings.tooltip;
                        TooltipFixed.wrapperElement!.classList.remove('tooltipFixed__active');
                    }),
                );
            }
        }
    }

    private static setStyle(settings: TooltipFixedSettings) {
        TooltipFixed.sheet = document.createElement('style');
        if (settings.setStyle) TooltipFixed.setStyleNotification(settings);
        document.body.appendChild(TooltipFixed.sheet);
    }

    private static setStyleNotification(settings: TooltipFixedSettings) {
        if (!settings.setStyle) return;

        Object.entries(settings.setStyle).forEach(([element, style]) => {
            const newStyle = Object.keys(style)
                .map((prop) => `${prop}:${style[prop]}`)
                .join(';');
            TooltipFixed.sheet.innerHTML += `.tooltipFixed__active ${element} { ${newStyle} } `;
        });
    }
}

export interface TooltipFixedSettings {
    element: string;
    html: string;
    id: string;
    setStyle?: { [name: string]: any };
    tooltip?: string;
}
