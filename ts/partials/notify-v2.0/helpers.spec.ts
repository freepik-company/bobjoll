import { Cookie } from 'bobjoll/ts/library/cookie';
import { User, isDebugTrue, isDebugTypeTrue } from './helpers';

it('Check debug should be false', () => {
    expect(isDebugTrue()).toBe(false);
});

it('Check debug mode by id', () => {
    Cookie.removeItem('notify-debug-ids');
    Cookie.removeItem('notify-debug-single');
    Cookie.removeItem('notify-debug-contains');

    Cookie.setItem('notify-debug-ids', 'cookie-notification,random-notification');

    expect(isDebugTypeTrue('popup')).toBe(false);
    expect(isDebugTypeTrue('banner')).toBe(false);
    expect(isDebugTypeTrue('cookie-notification')).toBe(true);
    expect(isDebugTypeTrue('random-notification')).toBe(true);

    expect(isDebugTrue()).toBe(true);
});

it('Check debug mode single', () => {
    Cookie.removeItem('notify-debug-ids');
    Cookie.removeItem('notify-debug-single');
    Cookie.removeItem('notify-debug-contains');

    Cookie.setItem('notify-debug-single', 'cookie-notification');

    expect(isDebugTypeTrue('cookie-notification')).toBe(true);

    expect(isDebugTrue()).toBe(true);
});

it('Check debug mode single', () => {
    Cookie.removeItem('notify-debug-ids');
    Cookie.removeItem('notify-debug-single');
    Cookie.removeItem('notify-debug-contains');

    Cookie.setItem('notify-debug-contains', 'notification');

    expect(isDebugTypeTrue('cookie-notification')).toBe(true);
    expect(isDebugTypeTrue('random-notification')).toBe(true);

    expect(isDebugTrue()).toBe(true);
});

it('Check user validation methods with Freepik/Flaticon Premium user', () => {
    Cookie.setItem('gr_session2', 'a%3A25%3A%7Bs%3A2%3A%22id%22%3Bs%3A6%3A%22996789%22%3Bs%3A5%3A%22login%22%3Bs%3A8%3A%22jkobjoll%22%3Bs%3A5%3A%22email%22%3Bs%3A20%3A%22jkobjoll%40freepik.com%22%3Bs%3A9%3A%22real_name%22%3Bs%3A12%3A%22Joel+Kobjoll%22%3Bs%3A6%3A%22avatar%22%3Bs%3A99%3A%22https%3A%2F%2Flh3.googleusercontent.com%2F-f_tL4bm6P6M%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2FxRgY_VdF_5c%2Fphoto.jpg%3Fsz%3D250%22%3Bs%3A7%3A%22premium%22%3Bs%3A1%3A%221%22%3Bs%3A14%3A%22cc_will_expire%22%3Bi%3A0%3Bs%3A2%3A%22ts%22%3Bi%3A1586434271%3Bs%3A15%3A%22premium_freepik%22%3Bs%3A1%3A%221%22%3Bs%3A16%3A%22premium_flaticon%22%3Bs%3A1%3A%221%22%3Bs%3A24%3A%22renewal_canceled_freepik%22%3Bi%3A0%3Bs%3A25%3A%22renewal_canceled_flaticon%22%3Bi%3A0%3Bs%3A21%3A%22renewal_canceled_plus%22%3Bi%3A0%3Bs%3A9%3A%22downloads%22%3Bi%3A0%3Bs%3A15%3A%22limit_downloads%22%3Bi%3A100%3Bs%3A13%3A%22creation_date%22%3Bs%3A19%3A%222015-12-16+11%3A00%3A57%22%3Bs%3A8%3A%22user_age%22%3Bs%3A9%3A%221261-1625%22%3Bs%3A12%3A%22user_type_fr%22%3Bs%3A27%3A%22payment-user-internal-staff%22%3Bs%3A10%3A%22profession%22%3Bs%3A18%3A%22Melonen+is+my+work%22%3Bs%3A12%3A%22first_buy_fr%22%3BN%3Bs%3A12%3A%22first_buy_fi%22%3BN%3Bs%3A10%3A%22pr_freq_fp%22%3Bs%3A4%3A%22none%22%3Bs%3A10%3A%22pr_freq_fi%22%3Bs%3A4%3A%22none%22%3Bs%3A10%3A%22newsletter%22%3Bi%3A1%3Bs%3A5%3A%22uhash%22%3Bs%3A5%3A%22.TK0a%22%3B%7D803fd2a23b665becb0f8518b1dfd826dff88b66e');
    const user = User();
    expect(user.showFree()).toBe(false);
    expect(user.showGuest()).toBe(false);
    expect(user.showLogged()).toBe(true);
    expect(user.showPremium()).toBe(true);
    expect(user.showPremiumFlaticon()).toBe(true);
    expect(user.showPremiumFlaticonAnnual()).toBe(false);
    expect(user.showPremiumFlaticonMonthly()).toBe(false);
    expect(user.showPremiumFreepik()).toBe(true);
    expect(user.showPremiumFreepikAnnual()).toBe(false);
    expect(user.showPremiumFreepikMonthly()).toBe(false);
    expect(user.showRenewalCanceledFlaticon()).toBe(false);
    expect(user.showRenewalCanceledFreepik()).toBe(false);
    expect(user.showRenewalCanceledPlus()).toBe(false);
});

it('Check user validation methods with flaticon freq update yearly', () => {
    Cookie.setItem('gr_session2', 'a%3A25%3A%7Bs%3A2%3A%22id%22%3Bs%3A6%3A%22996789%22%3Bs%3A5%3A%22login%22%3Bs%3A8%3A%22jkobjoll%22%3Bs%3A5%3A%22email%22%3Bs%3A20%3A%22jkobjoll%40freepik.com%22%3Bs%3A9%3A%22real_name%22%3Bs%3A12%3A%22Joel+Kobjoll%22%3Bs%3A6%3A%22avatar%22%3Bs%3A99%3A%22https%3A%2F%2Flh3.googleusercontent.com%2F-f_tL4bm6P6M%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2FxRgY_VdF_5c%2Fphoto.jpg%3Fsz%3D250%22%3Bs%3A7%3A%22premium%22%3Bs%3A1%3A%221%22%3Bs%3A14%3A%22cc_will_expire%22%3Bi%3A0%3Bs%3A2%3A%22ts%22%3Bi%3A1586434271%3Bs%3A15%3A%22premium_freepik%22%3Bs%3A1%3A%221%22%3Bs%3A16%3A%22premium_flaticon%22%3Bs%3A1%3A%221%22%3Bs%3A24%3A%22renewal_canceled_freepik%22%3Bi%3A0%3Bs%3A25%3A%22renewal_canceled_flaticon%22%3Bi%3A0%3Bs%3A21%3A%22renewal_canceled_plus%22%3Bi%3A0%3Bs%3A9%3A%22downloads%22%3Bi%3A0%3Bs%3A15%3A%22limit_downloads%22%3Bi%3A100%3Bs%3A13%3A%22creation_date%22%3Bs%3A19%3A%222015-12-16+11%3A00%3A57%22%3Bs%3A8%3A%22user_age%22%3Bs%3A9%3A%221261-1625%22%3Bs%3A12%3A%22user_type_fr%22%3Bs%3A27%3A%22payment-user-internal-staff%22%3Bs%3A10%3A%22profession%22%3Bs%3A18%3A%22Melonen+is+my+work%22%3Bs%3A12%3A%22first_buy_fr%22%3BN%3Bs%3A12%3A%22first_buy_fi%22%3BN%3Bs%3A10%3A%22pr_freq_fp%22%3Bs%3A4%3A%22none%22%3Bs%3A10%3A%22pr_freq_fi%22%3Bs%3A4%3A%22year%22%3Bs%3A10%3A%22newsletter%22%3Bi%3A1%3Bs%3A5%3A%22uhash%22%3Bs%3A5%3A%22.TK0a%22%3B%7D803fd2a23b665becb0f8518b1dfd826dff88b66e');
    const user = User();
    expect(user.showFree()).toBe(false);
    expect(user.showGuest()).toBe(false);
    expect(user.showLogged()).toBe(true);
    expect(user.showPremium()).toBe(true);
    expect(user.showPremiumFlaticon()).toBe(true);
    expect(user.showPremiumFlaticonAnnual()).toBe(true);
    expect(user.showPremiumFlaticonMonthly()).toBe(false);
    expect(user.showPremiumFreepik()).toBe(true);
    expect(user.showPremiumFreepikAnnual()).toBe(false);
    expect(user.showPremiumFreepikMonthly()).toBe(false);
    expect(user.showRenewalCanceledFlaticon()).toBe(false);
    expect(user.showRenewalCanceledFreepik()).toBe(false);
    expect(user.showRenewalCanceledPlus()).toBe(false);
});

it('Check user validation methods with free user', () => {
    Cookie.setItem('gr_session2', 'a%3A25%3A%7Bs%3A2%3A%22id%22%3Bs%3A8%3A%2217560756%22%3Bs%3A5%3A%22login%22%3Bs%3A12%3A%22user17560756%22%3Bs%3A5%3A%22email%22%3Bs%3A17%3A%22kobjoll%40gmail.com%22%3Bs%3A9%3A%22real_name%22%3Bs%3A4%3A%22Joel%22%3Bs%3A6%3A%22avatar%22%3Bs%3A89%3A%22https%3A%2F%2Flh3.googleusercontent.com%2Fa-%2FAAuE7mD4K5Ys35YcZW-RL0AgFM6l72LQ9v1CgZllUsWyZA%3Ds96-c%22%3Bs%3A7%3A%22premium%22%3Bi%3A0%3Bs%3A14%3A%22cc_will_expire%22%3Bi%3A0%3Bs%3A2%3A%22ts%22%3Bi%3A1586416843%3Bs%3A15%3A%22premium_freepik%22%3Bs%3A1%3A%220%22%3Bs%3A16%3A%22premium_flaticon%22%3Bs%3A1%3A%220%22%3Bs%3A24%3A%22renewal_canceled_freepik%22%3Bi%3A0%3Bs%3A25%3A%22renewal_canceled_flaticon%22%3Bi%3A0%3Bs%3A21%3A%22renewal_canceled_plus%22%3Bi%3A0%3Bs%3A9%3A%22downloads%22%3Bi%3A0%3Bs%3A15%3A%22limit_downloads%22%3Bi%3A10%3Bs%3A13%3A%22creation_date%22%3Bs%3A19%3A%222019-11-22+14%3A52%3A18%22%3Bs%3A8%3A%22user_age%22%3Bs%3A6%3A%2291-180%22%3Bs%3A12%3A%22user_type_fr%22%3Bs%3A10%3A%22registered%22%3Bs%3A10%3A%22profession%22%3Bs%3A1%3A%220%22%3Bs%3A12%3A%22first_buy_fr%22%3BN%3Bs%3A12%3A%22first_buy_fi%22%3BN%3Bs%3A10%3A%22pr_freq_fp%22%3Bs%3A4%3A%22none%22%3Bs%3A10%3A%22pr_freq_fi%22%3Bs%3A4%3A%22none%22%3Bs%3A10%3A%22newsletter%22%3Bi%3A0%3Bs%3A5%3A%22uhash%22%3Bs%3A5%3A%22b3d72%22%3B%7D7a22d90b97b03f9653815b9ac24629530bb4c1e5');
    const user = User();
    expect(user.showFree()).toBe(true);
    expect(user.showGuest()).toBe(false);
    expect(user.showLogged()).toBe(true);
    expect(user.showPremium()).toBe(false);
    expect(user.showPremiumFlaticon()).toBe(false);
    expect(user.showPremiumFlaticonAnnual()).toBe(false);
    expect(user.showPremiumFlaticonMonthly()).toBe(false);
    expect(user.showPremiumFreepik()).toBe(false);
    expect(user.showPremiumFreepikAnnual()).toBe(false);
    expect(user.showPremiumFreepikMonthly()).toBe(false);
    expect(user.showRenewalCanceledFlaticon()).toBe(false);
    expect(user.showRenewalCanceledFreepik()).toBe(false);
    expect(user.showRenewalCanceledPlus()).toBe(false);
});

it('Check user validation methods with anonymous user', () => {
    Cookie.removeItem('gr_session2');
    const user = User();
    expect(user.showFree()).toBe(false);
    expect(user.showGuest()).toBe(true);
    expect(user.showLogged()).toBe(false);
    expect(user.showPremium()).toBe(false);
    expect(user.showPremiumFlaticon()).toBe(false);
    expect(user.showPremiumFlaticonAnnual()).toBe(false);
    expect(user.showPremiumFlaticonMonthly()).toBe(false);
    expect(user.showPremiumFreepik()).toBe(false);
    expect(user.showPremiumFreepikAnnual()).toBe(false);
    expect(user.showPremiumFreepikMonthly()).toBe(false);
    expect(user.showRenewalCanceledFlaticon()).toBe(false);
    expect(user.showRenewalCanceledFreepik()).toBe(false);
    expect(user.showRenewalCanceledPlus()).toBe(false);
});