import { Cookie as cookie } from 'bobjoll/ts/library/cookie';
import { q, qq } from 'bobjoll/ts/library/dom';

export class TooltipFixed {
    private static readonly templateContent = require('BobjollTemplate/tooltipFixed-v1.0/tooltipFixed.html.hbs');
    private static cookieName: string;
    private static sheet: HTMLStyleElement;
    private static wrapperElement: HTMLElement | null;
    private static tooltipElement: HTMLElement | null;

    public static add(settings: TooltipFixedSettings) {
        TooltipFixed.cookieName = `tooltipFixed-${settings.cookieId}`;
        TooltipFixed.wrapperElement = q(settings.elementToInsert);

        if (cookie.getItem(TooltipFixed.cookieName) || !TooltipFixed.wrapperElement) return;

        if (!settings.tooltip) {
            settings.tooltip = TooltipFixed.wrapperElement.innerHTML;
        }
        settings.setStyle && TooltipFixed.setStyle(settings);

        TooltipFixed.wrapperElement.innerHTML = this.templateContent({
            appearance: settings.appearance || 'light',
            html: settings.html,
            insertContainer: settings.insertContainer,
            position: settings.position || 'bottom',
        });

        TooltipFixed.tooltipElement = settings.insertContainer
            ? q('.tooltip__container', TooltipFixed.wrapperElement)
            : TooltipFixed.wrapperElement;

        !settings.insertContainer && TooltipFixed.wrapperElement.classList.add('tooltipFixed__active');

        TooltipFixed.closeEvent(settings);
    }

    private static getExpireCookie(days: number) {
        return new Date().getTime() + 24 * days * 60 * 60 * 1000;
    }

    private static closeEvent(settings: TooltipFixedSettings) {
        if (!TooltipFixed.wrapperElement) return;

        const cookieExpiresAt30days = TooltipFixed.getExpireCookie(30);

        qq('.notification__close, .button-close', TooltipFixed.wrapperElement).forEach((buttonElement) =>
            buttonElement.addEventListener('click', () => {
                if (!settings.buttonCloseForever) {
                    cookie.setItem(
                        TooltipFixed.cookieName,
                        '1', {
                        expires: new Date(cookieExpiresAt30days),
                    });
                }

                if (settings.tooltip) TooltipFixed.wrapperElement!.innerHTML = settings.tooltip;

                TooltipFixed.tooltipElement?.classList.remove('tooltipFixed__active');
            }),
        );

        if (settings.buttonCloseForever) {
            const cookieExpiresAt365days = TooltipFixed.getExpireCookie(365);

            q('.button-close-forever', TooltipFixed.wrapperElement)?.addEventListener('click', () => {
                cookie.setItem(
                    TooltipFixed.cookieName,
                    '1', {
                    expires: new Date(cookieExpiresAt365days),
                });

                if (settings.tooltip) TooltipFixed.wrapperElement!.innerHTML = settings.tooltip;

                TooltipFixed.tooltipElement?.classList.remove('tooltipFixed__active');
            });
        }
    }

    private static setStyle(settings: TooltipFixedSettings) {
        TooltipFixed.sheet = document.createElement('style');
        settings.setStyle && TooltipFixed.setStyleNotification(settings);
        document.body.appendChild(TooltipFixed.sheet);
    }

    private static setStyleNotification(settings: TooltipFixedSettings) {
        if (!settings.setStyle) return;

        Object.entries(settings.setStyle).forEach(([element, style]) => {
            const newStyle = Object.keys(style)
                .map((prop) => `${prop}:${style[prop]}`)
                .join(';');
            TooltipFixed.sheet.innerHTML += `${settings.elementToInsert} ${element} { ${newStyle} } `;
        });
    }
}

type TooltipAppearance = 'light' | 'blue';
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipFixedSettings {
    appearance?: TooltipAppearance;
    buttonCloseForever?: boolean;
    cookieId: string;
    elementToInsert: string;
    html: string;
    insertContainer: boolean;
    position?: TooltipPosition;
    setStyle?: { [name: string]: any };
    tooltip?: string;
}
