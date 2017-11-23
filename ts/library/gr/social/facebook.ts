/// <reference types="facebook-js-sdk" />

namespace facebook {
    export interface FacebookStatic extends fb.FacebookStatic {
        getUserID(): string;
    }
}

declare var FACEBOOK_AUTH_TIMEOUT_MESSAGE: string;

declare var FB: facebook.FacebookStatic;

import Social from './index';

export default class Facebook extends Social {
    private static scope: string = 'public_profile, email';

    public static getInstance() {
        Facebook.init();

        return Facebook;
    }

    public static async connect() {
        let response = await new Promise(function(resolve, reject) {
            let timeout;

            try {
                if (FB.getUserID() === '') {
                    FB.login((response) => {
                        if (response.authResponse) {
                            resolve(response);
                        } else {
                            reject({
                                status: false,
                                message: 'Login cancelled or not fully authorized.'
                            });
                        }
                    }, {scope: Facebook.scope});
                } else {
                    FB.getLoginStatus(resolve);
                }

                timeout = setTimeout(() => reject(('undefined' !== FACEBOOK_AUTH_TIMEOUT_MESSAGE ? FACEBOOK_AUTH_TIMEOUT_MESSAGE : 'Facebook authentication timeout')), 10000);
            } catch(e) {
                reject(e);
            } finally {
                if (timeout) {
                    clearTimeout(timeout);
                }
            }
        });

        return Facebook.status((response as any));
    }

    public static disconnect() {
        if (Facebook.gr) {
            FB.api('/me/permissions', 'delete', function(response: fb.AuthResponse) {
                try {
                    Facebook.connected = false;
                    Facebook.gr.logout();
                } catch(e) {
                    console.error(`There has been an error on the logout request. Error: ${e}`);
                }
			});
        }
    }

    private static sdk() {
        if (!document.getElementById('facebook-jssdk')) {
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];

                if (d.getElementById(id)) return;

                js = (d.createElement(s) as HTMLScriptElement);
                js.id = id;
                js.src = '//connect.facebook.net/en_US/sdk.js';

                if (fjs.parentNode) fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        }
    }

    private static init() {
        Facebook.setup();
        Facebook.sdk();
    }

    private static setup() {
        (window as any).fbAsyncInit = () => {
            FB.init({
                appId: FACEBOOK_APP_ID,
                cookie: true,
                xfbml: false,
                version: 'v2.8'
            });

            FB.getLoginStatus((response) => {});

            delete (window as any).fbAsyncInit;
        };
    }

    private static async status(response: fb.AuthResponse)  {
        let action: 'login' | 'register' | 'connect' = 'connect';
        let data = new FormData();
        let uid: string;

        if (response) {
            if ('connected' === response.status) {
                uid = response.authResponse.userID;

                data.append('facebook_id', uid);

                if (uid && Facebook.gr && Facebook.gr.isLogged()) {
                    action = 'connect';

                    data.append('social_network', 'facebook');            

                    Facebook.connected = true;
                }
                else {
                    action = 'login';
                }
            }
            else if ('register' === response.status) {
                let action = 'register';

                await new Promise(function(resolve, reject) {
                    try {
                        FB.api('/me?fields=id,email,name,locale,token_for_business', function(userResponse: any) {
                            FB.api('/me/picture', {
                                'redirect': false,
                                'height': '200',
                                'type': 'normal',
                                'width': '200'
                            }, function(response: any) {
                                data.append('facebook_id', userResponse.id);
                                data.append('email', userResponse.email);
                                data.append('name', userResponse.name);
                                data.append('language', userResponse.locale);
                                data.append('avatar', (response && !response.error && !response.data.is_silhouette) ? response.data.url : false);

                                resolve();
                            });
                        });
                    } catch(e) {
                        reject(`Error ocurred during facebook register. Error: ${e}`);
                    }                    
                });
            }
        }

        return Facebook.auth(action, data);
    }
}