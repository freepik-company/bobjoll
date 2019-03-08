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
        const response = await new Promise((resolve, reject) => {
            if ('' === FB.getUserID()) {
                FB.login((response) => {
                    if (response.authResponse) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                }, {
                    scope: 'public_profile, email'
                })
            } else {
                FB.getLoginStatus((response) => resolve(response));
            }
        });

        return Facebook.status(<fb.AuthResponse>response);
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

    private static async status(response: any)  {
        let action: 'login' | 'register' | 'connect' = 'login';
        let data = new FormData();

        if (response) {
            if ('connected' === response.status) {
                data.append('facebook_id', response.authResponse.userID);
                data.append('social_network', 'facebook');                
                
                if (Facebook.gr && Facebook.gr.isLogged()) action = 'connect';
            } else if ('register' === response.status) {
                let user = await new Promise((resolve, reject) => {
                    try {
                        FB.api('/me?fields=id,email,name,locale,token_for_business', (fields: any) => {
                            FB.api('/me/picture', {
                                'redirect': false,
                                'height': '200',
                                'type': 'normal',
                                'width': '200'
                            }, (picture: any) => {
                                action = 'register';

                                data.append('facebook_id', fields.id);
                                data.append('email', fields.email);
                                data.append('name', fields.name);
                                data.append('language', fields.locale);
                                data.append('avatar', (picture && !picture.error && !picture.data.is_silhouette) ? picture.data.url : false);
                                data.append('fb_token', fields.token_for_business);

                                resolve({
                                    fields: fields,
                                    picture: picture,
                                });
                            });
                        });
                    } catch(err) {
                        reject(err);
                    }
                });
            }
        }

        let auth: any = await Facebook.auth(action, data);

        if ('register' === auth.data.status) {
            auth = await Facebook.status({
                status: 'register'
            });

            if (true === auth.data.status) {
                auth = await Facebook.connect();
            }
        }


        return auth;
    }
}