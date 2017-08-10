import Social from './index';
import {pu, do_pu, do_clicked_pu} from './dependency/twitter_pu.js';

export default class Twitter extends Social {
    private static loaded: boolean = false;

    public static getInstance() {
        return Twitter;
    }

    public static async connect() {
        let response: any = await Twitter.request('POST', '/profile/request/twitter/authorize_url');

        if (response && response.data && response.data.authorize_url) {
            // Generate Popup
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