import Social from './index';
import {pu, do_pu, do_clicked_pu} from './dependency/twitter_pu.js';

export default class Twitter extends Social {
    private static loaded: boolean = false;
    public static register: Function;

    public static getInstance() {
        return Twitter;
    }

    public static status(args: {
        result: 'login' | 'register' | 'connect';
        twitter_id?: string;
        username?: string;
        language?: string;
        avatar?: string;
        message?: string;
    }) {
        let data = new FormData();

        if ('function' === typeof Twitter.register) {
            data.append('twitter_id', args.twitter_id || '0');

            if (args.result.match(/error/) && args.message) {
                throw Error(args.message);
            }

            if (args.result.match(/login|connect/)) {                
                Twitter.auth(args.result, data);
            }

            if (args.result.match(/register/) && 'function' === typeof Twitter.register) {
                data.append('username', args.username || '');
                data.append('avatar', args.avatar || '');

                Twitter.register(data);
            }
        }
    }

    public static async connect() {
        let response: any = await Twitter.request('POST', '/profile/request/twitter/authorize_url');

        if (response && response.data && response.data.authorize_url) {
            pu(response.data.authorize_url);
        }
    }

    public static disconnect() {
        if (gr.auth.logged)
		{
            var request = gr.request.delete('profile/connect', {social_network: 'twitter'});
            
			Twitter.connected = false;
		}
    }
}