interface SocialResponse {
    callback: string;
    data: {
        message: string;
        post_callback: string;
        redirect_url: string;
        status: boolean;
        errors: string[];
    }
}

declare var gr: any;

export default class Social {
    public static connected: boolean = false;
    public static gr = gr || undefined;

    public static request(method: 'DELETE' | 'POST', url: string, data?: FormData) {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            
            req.addEventListener('load', () => {
                try {
                    if (req.status !== 200) {
                        reject(req.response);   
                    }

                    resolve(JSON.parse(req.response));
                }
                catch (e) {
                    reject('Error reading response (json):' + req.response);
                }
            });

            req.open(method, url);
            req.setRequestHeader('X-Requested-With', 'xmlhttprequest');
            req.send(data || {});
        });
    }

    public static auth(action: 'login' | 'register' | 'connect', data: FormData) {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            
            req.addEventListener('load', () => {
                try {
                    if (req.status === 200) {
                        const ret: SocialResponse = JSON.parse(req.response);

                        if (ret.data.status) {
                            if ('undefined' !== typeof gr && ret.data && ret.data.status) {
                                gr.updateUser();
                                gr.updateUI();
                                gr.triggerLogin(gr.user);
                            }

                            resolve(ret);
                        }
                        else {
                            reject(ret.data.message || ret.data.errors);
                        }
                    }
                    else {
                        reject('Error in user login (' + req.status + '): ' + req.response);
                    }
                }
                catch (e) {
                    console.error('Error reading response (json):', req.response);
                    reject('Error reading response (json):' + req.response);
                }
            });

            req.open('POST', action == 'login' ? '/profile/request/login/social_login' : (action == 'register' ? '/profile/request/login/register' : '/profile/request/profile/connect'));
            req.setRequestHeader('X-Requested-With', 'xmlhttprequest');
            req.send(data);
        }) as Promise<SocialResponse | undefined>;
    }
}