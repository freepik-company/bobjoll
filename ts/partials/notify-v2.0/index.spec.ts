import { Notify } from '.';
import Axios from 'axios';
import { NotifyBannerMethod } from './notifyBannerMethod';
import { NotifyModalMethod } from './notifyModalMethod';

const response = require('./response.json');

it('test notify priority with quechua', async () => {
    const stub = jest.spyOn(Axios, 'get').mockResolvedValue({
        "banners": [
            {
                "id": "banner-birthdaypiki10-2",
            }
        ],
        "popups": [
            {
                "id": "popup-birthdaypiki10-2",
            }
        ]
    });
    const bannerInstance = [];
    const notify = new Notify({
        quechua: [
            {
                async: true,
                handler: res => {
                    const { banners = [], popups = [] } = res;
                    banners.forEach(({
                        id,
                    }: any) => {
                        const dateEnd = new Date('01/01/3000 00:00:00');
                        const dateStart = new Date('01/01/2020 00:00:00');
                        const banner = new NotifyBannerMethod({
                            bannerOptions: {
                                html: `quechua notification`,
                            },
                            cookieExpire: () => new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
                            id,
                            position: 'top',
                            priority: 3,
                            schedule: {
                                dateEnd,
                                dateStart,
                            }
                        });
                        bannerInstance.push(banner);
                        notify.add(banner);
                    });
                    popups.forEach(({
                        id,
                    }: any) => {
                        const dateEnd = new Date('01/01/3000 00:00:00');
                        const dateStart = new Date('01/01/2020 00:00:00');
                        const banner = new NotifyModalMethod({
                            modalOptions: {
                                html: `quechua modal notification`,
                            },
                            cookieExpire: () => new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
                            id,
                            priority: 2,
                            schedule: {
                                dateEnd,
                                dateStart,
                            }
                        });
                        bannerInstance.push(banner);
                        notify.add(banner);
                    });
                },
                url: 'https://static.freepikcompany.com/freepik/birthdaypiki2/campaign-birthdaypiki2.json',
            }
        ]
    });

    const cookieBanner = new NotifyBannerMethod({
        awaitQuechua: false,
        bannerOptions: {
            html: 'cookie notification disclaimer',
        },
        cookieExpire: () => new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        id: 'cookie-notification',
        position: 'top',
        priority: 0,
    });
    notify.add(cookieBanner);

    const randomBanner = new NotifyBannerMethod({
        awaitQuechua: true,
        bannerOptions: {
            html: 'random notification text',
        },
        cookieExpire: () => new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        id: 'random-notification',
        position: 'top',
        priority: 4,
    });
    notify.add(randomBanner);

    /**
     * Cookie
     */
    await notify.publishQueue();
    expect(document.body.innerHTML).toContain(`id=\"cookie-notification\" class=\"notification notify notify--banner notification--static notification--no-shadow notification--no-border notification--hide-disable mg-none-i notification--show\"`);
    expect(document.body.innerHTML).toContain('cookie notification disclaimer');
    cookieBanner.destroy();
    expect(document.body.innerHTML).not.toContain(`id=\"cookie-notification\" class=\"notification notify notify--banner notification--static notification--no-shadow notification--no-border notification--hide-disable mg-none-i notification--show\"`);
    /**
     * Quechua Popup
     */
    await notify.publishQueue();
    expect(document.body.innerHTML).toContain(`id=\"modal-popup-birthdaypiki10-2\" class=\"modal active\"`);
    expect(document.body.innerHTML).toContain('quechua modal notification');
    bannerInstance[1].destroy();
    expect(document.body.innerHTML).not.toContain(`id=\"modal-popup-birthdaypiki10-2\" class=\"modal active\"`);
    /**
     * Quechua Banner
     */
    await notify.publishQueue();
    expect(document.body.innerHTML).toContain(`id=\"banner-birthdaypiki10-2\" class=\"notification notify notify--banner notification--static notification--no-shadow notification--no-border notification--hide-disable mg-none-i notification--show\"`);
    expect(document.body.innerHTML).toContain('quechua notification');
    bannerInstance[0].destroy();
    expect(document.body.innerHTML).not.toContain(`id=\"banner-birthdaypiki10-2\" class=\"notification notify notify--banner notification--static notification--no-shadow notification--no-border notification--hide-disable mg-none-i notification--show\"`);
    /**
     * Random Banner
     */
    await notify.publishQueue();
    await new Promise(resolve => setTimeout(resolve, 100)); // This is not aware of quechua promise, this is why we force to wait
    expect(document.body.innerHTML).toContain(`id=\"random-notification\" class=\"notification notify notify--banner notification--static notification--no-shadow notification--no-border notification--hide-disable mg-none-i notification--show\"`);
    expect(document.body.innerHTML).toContain('random notification');
    randomBanner.destroy();
    expect(document.body.innerHTML).not.toContain(`id=\"random-notification\" class=\"notification notify notify--banner notification--static notification--no-shadow notification--no-border notification--hide-disable mg-none-i notification--show\"`);

    expect(stub).toHaveBeenCalledWith('https://static.freepikcompany.com/freepik/birthdaypiki2/campaign-birthdaypiki2.json', { "withCredentials": false });

});
