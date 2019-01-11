declare var gr: any;

export default class Social {
    public static connected: boolean = false;
    public static gr = gr ||  undefined;

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
            req.send.apply(null, data);
        });
    }

    public static auth(action: 'login' | 'register' | 'connect', data: FormData) {
        if ('undefined' !== typeof gr) {
            return gr.socialAuthHandler(action, data);
        }
    }
}