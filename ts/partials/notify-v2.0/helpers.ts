import { Cookie } from 'bobjoll/ts/library/cookie';
import { NotifyMethodValidationMethod, NotifyMethodValidation } from './notifyMethod';

const Unserialize = require('locutus/php/var/unserialize');

export const User: () => UserValidationMethods = function() {
    const user = getUserByCookie();
    return {
        showFree: (): boolean => (user && !user.premium ? true : false),
        showGuest: (): boolean => (user ? false : true),
        showLogged: (): boolean => (user ? true : false),
        showPremium: (): boolean => (user && user.premium ? true : false),
        showPremiumFlaticon: (): boolean => (user && user.premium_flaticon ? true : false),
        showPremiumFreepik: (): boolean => (user && user.premium_freepik ? true : false),
        showPremiumFlaticonAnnual: (): boolean => (user && 'year' === user.pr_freq_fi ? true : false),
        showPremiumFlaticonMonthly: (): boolean => (user && 'month' === user.pr_freq_fi ? true : false),
        showPremiumFreepikAnnual: (): boolean => (user && 'year' === user.pr_freq_fr ? true : false),
        showPremiumFreepikMonthly: (): boolean => (user && 'month' === user.pr_freq_fr ? true : false),
        showRenewalCanceledFlaticon: (): boolean => (user && user.renewal_canceled_flaticon ? true : false),
        showRenewalCanceledFreepik: (): boolean => (user && user.renewal_canceled_freepik ? true : false),
        showRenewalCanceledPlus: (): boolean => (user && user.renewal_canceled_plus ? true : false),
    };
};

export const isDebugTrue = (): boolean => {
    return ['notify-debug-single', 'notify-debug-ids', 'notify-debug-contains'].filter(cookieName => (Cookie.getItem(cookieName) ? true : false)).length
        ? true
        : false;
};
export const isDebugTypeTrue = (id: string): boolean => isDebugSingle(id) || isDebugContains(id) || isDebugById(id);

const isDebugById = (id: string): boolean => (Cookie.getItem('notify-debug-ids') || '').split(',').indexOf(id) >= 0;
const isDebugSingle = (id: string): boolean => id === Cookie.getItem('notify-debug-single');
const isDebugContains = (id: string): boolean => id.indexOf(Cookie.getItem('notify-debug-contains') || '') >= 0;

export interface UserValidationMethods extends NotifyMethodValidation {
    showFree: NotifyMethodValidationMethod;
    showGuest: NotifyMethodValidationMethod;
    showLogged: NotifyMethodValidationMethod;
    showPremium: NotifyMethodValidationMethod;
    showPremiumFlaticon: NotifyMethodValidationMethod;
    showPremiumFreepik: NotifyMethodValidationMethod;
    showPremiumFlaticonAnnual: NotifyMethodValidationMethod;
    showPremiumFlaticonMonthly: NotifyMethodValidationMethod;
    showPremiumFreepikAnnual: NotifyMethodValidationMethod;
    showPremiumFreepikMonthly: NotifyMethodValidationMethod;
    showRenewalCanceledFlaticon: NotifyMethodValidationMethod;
    showRenewalCanceledFreepik: NotifyMethodValidationMethod;
    showRenewalCanceledPlus: NotifyMethodValidationMethod;
}

export const getUserByCookie = (): UserSession | null => {
    const cookie = decodeURIComponent(document.cookie.replace(new RegExp(`(?:(?:^|.*;)\\s*gr_session2\\s*\\=\\s*([^;]*).*$)|^.*$`), '$1'));
    if (cookie) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (Unserialize(cookie) as any) || null;
        if (user) {
            return [
                'cc_will_expire',
                'premium_flaticon',
                'premium_freepik',
                'premium',
                'renewal_canceled_flaticon',
                'renewal_canceled_freepik',
                'renewal_canceled_plus',
            ].reduce((acc, key) => ((acc[key] = 1 == acc[key]), acc), user);
        }
    }
    return null;
};

export interface UserSession {
    avatar: string;
    cc_will_expire: boolean;
    creation_date: string;
    downloads: number;
    email: string;
    first_buy_fi: null;
    first_buy_fr: null;
    id: string;
    limit_downloads: number;
    login: string;
    pr_freq_fi: UserSessionRenewFrequency;
    pr_freq_fr: UserSessionRenewFrequency;
    premium_flaticon: boolean;
    premium_freepik: boolean;
    premium: boolean;
    profession: string;
    real_name: string;
    renewal_canceled_flaticon: boolean;
    renewal_canceled_freepik: boolean;
    renewal_canceled_plus: boolean;
    ts: number;
    user_age: string;
    user_type_fr: string;
}

export type UserSessionRenewFrequency = 'none' | 'month' | 'year';
