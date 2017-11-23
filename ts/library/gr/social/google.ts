/// <reference types="gapi.auth2" />

declare var GOOGLE_AUTH_TIMEOUT_MESSAGE: string;

import Social from './index';

export default class Google extends Social {
    private static loaded: boolean = false;

    public static getInstance() {
        Google.init();

        return Google;
    }

    public static async connect() {
        if (!Google.loaded) {
            return;
        }

        return gapi.auth2.getAuthInstance().signIn({
            scope: 'email profile'
        }).then((response: GoogleApiOAuth2TokenObject) => Google.status(response)); 
    }

    public static disconnect() {
        if (Google.gr && Google.gr.isLogged()) {
            gapi.auth2.getAuthInstance().signOut().then((response: GoogleApiOAuth2TokenObject) => {
                if (response && !response.error) {
                    let data = new FormData();

                    try {
                        var result = gapi.auth.getToken();
                        var request = new XMLHttpRequest();

                        request.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + result.access_token, false);
                        request.send();
                    } catch (e) { };

                    data.append('social_network', 'google');

                    Google.request('DELETE', 'profile/connect', data);
                    Google.connected = false;
                }
            });
		}
    }

    private static sdk() {
        if (!document.getElementById('google-jssdk')) {
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];

                if (d.getElementById(id)) return;

                js = (d.createElement(s) as HTMLScriptElement); 
                
                js.id = id;
                js.src = 'https://apis.google.com/js/api:client.js?onload=google_init';

                if (fjs.parentNode) fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'google-jssdk'));
        }
    }

    private static init() {
        Google.setup();
        Google.sdk();
    }

    private static setup() {
        (window as any).google_init = async function() {
            await new Promise((resolve) => {
                gapi.load('client:auth2', () => resolve());                
            });

            gapi.auth2.init({
                client_id: GOOGLE_CLIENT_ID
            });

            Google.loaded = true;

            delete (window as any).google_init;
        };
    }

    private static async status(response: GoogleApiOAuth2TokenObject)  {
        let data: any = await new Promise(function(resolve, reject) {
            try {
                gapi.client.load('plus', 'v1', function() {
                    let request = (gapi.client as any).plus.people.get( { 'userId' : 'me' });

                    request.execute((response: any) => resolve(response));
                });
            } catch(e) {
                reject(e);
            }
        });

        try {
            let action: 'login' | 'connect' = 'connect';
            let form: FormData = new FormData();

            if (Google.gr && Google.gr.isLogged()) {
                action = 'connect';

                Google.connected = true;

                form.append('google_id', data.result.id);
                form.append('social_network', 'google');
            }
            else {
                action = 'login';

                form.append('google_id', data.result.id);
                form.append('email', data.emails[0].value);
                form.append('name', data.result.name.givenName);
                form.append('avatar', ((typeof data.image.url !== "undefined") && !data.image.isDefault) ? data.image.url.slice(0, -2) + "250" : '');
            }

            return Google.auth(action, form);
        } catch(e) {
            throw Error(data.message || data.data.message);
        }
    }
}