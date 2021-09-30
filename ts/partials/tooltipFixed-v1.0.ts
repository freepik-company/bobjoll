import { Cookie as cookie } from 'bobjoll/ts/library/cookie';
import { q, qq } from 'bobjoll/ts/library/dom';

export class TooltipFixed {
    private static readonly templateContent = require('BobjollTemplate/tooltipFixed-v1.0/tooltipFixed.html.hbs');
    private static cookieName: string;
    private static sheet: HTMLStyleElement;
    private static wrapperElement: HTMLElement | null;
    private static tooltipElement: HTMLElement | null;
    private static cookieFinalValue = '1';

    public static add(settings: TooltipFixedSettings) {
        TooltipFixed.cookieName = `tooltipFixed-${settings.cookieId}`;
        TooltipFixed.wrapperElement = q(settings.elementToInsert);

        const cookieValue = cookie.getItem(TooltipFixed.cookieName);

        if ((cookieValue && cookieValue === '1') || !TooltipFixed.wrapperElement) return false;

        if (cookieValue && !this.showReappearedTooltip(cookieValue)) return false;

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

        settings.breakpoint && TooltipFixed.showTooltipFromBreakpoint(settings.breakpoint);

        !settings.insertContainer && TooltipFixed.wrapperElement.classList.add('tooltipFixed__active');

        TooltipFixed.closeEvent(settings);

        return TooltipFixed.tooltipElement;
    }

    private static showTooltipFromBreakpoint(breakpoint: MaxMinBreakpoint) {
        const { from, min } = breakpoint;

        ['tooltipFixed__breakpoint', `tooltipFixed__breakpoint-${from}`, `tooltipFixed__breakpoint-${from}--${min ? 'min' : 'max'}`]
            .forEach(classes => TooltipFixed.tooltipElement?.classList.add(classes));
    }

    private static showReappearedTooltip(cookieValue: string) {
        if (cookieValue !== '1' && new Date() > new Date(parseInt(cookieValue))) {
            return true;
        }

        return false;
    }

    private static getExpireCookie(days: number) {
        return new Date().getTime() + 24 * days * 60 * 60 * 1000;
    }

    private static initClickEvent(settings: TooltipFixedSettings, cookieValue: string, cookieExpires: Date) {
        if (cookie.getItem(TooltipFixed.cookieName)) {
            cookieValue = this.cookieFinalValue;
        }

        cookie.setItem(
            TooltipFixed.cookieName,
            cookieValue, {
            expires: cookieExpires,
        });

        if (settings.tooltip) TooltipFixed.wrapperElement!.innerHTML = settings.tooltip;

        TooltipFixed.tooltipElement?.classList.remove('tooltipFixed__active');
    }

    private static closeEvent(settings: TooltipFixedSettings) {
        if (!TooltipFixed.wrapperElement) return;

        const cookieExpiresAt30days = new Date(TooltipFixed.getExpireCookie(30));
        const cookieExpiresAt365days = new Date(TooltipFixed.getExpireCookie(365));
        const cookieReappearValue = TooltipFixed.getExpireCookie(settings.timesToReappearInDays || 1).toString();

        qq('.notification__close, .button-close', TooltipFixed.wrapperElement).forEach((buttonElement) =>
            buttonElement.addEventListener('click', () => {
                this.initClickEvent(
                    settings,
                    settings.buttonCloseForever ? cookieReappearValue : this.cookieFinalValue,
                    settings.buttonCloseForever ? cookieExpiresAt365days : cookieExpiresAt30days
                )
            }),
        );

        if (settings.buttonCloseForever) {
            q('.button-close-forever', TooltipFixed.wrapperElement)?.addEventListener('click', () =>
                this.initClickEvent(
                    settings,
                    this.cookieFinalValue,
                    new Date(cookieExpiresAt365days)
                )
            );
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
type TooltipBreakpoint = 'xs' | 'sm' | 'md' | 'lg';

interface MaxMinBreakpoint {
    from: TooltipBreakpoint;
    min: boolean;
}

export interface TooltipFixedSettings {
    appearance?: TooltipAppearance;
    breakpoint?: MaxMinBreakpoint;
    buttonCloseForever?: boolean;
    cookieId: string;
    elementToInsert: string;
    html: string;
    insertContainer: boolean;
    position?: TooltipPosition;
    setStyle?: { [name: string]: any };
    timesToReappearInDays?: number;
    tooltip?: string;
}
