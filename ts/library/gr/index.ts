import { qq, q, qi } from './dom.q';
import { KEvent, KEventTarget } from 'BobjollPath/library/event';

export interface GrUser {
    id: number;
    login: string;
    email: string;
    avatar: string;
    premium: boolean;
    cc_will_expire: boolean;
    connected_google?: boolean;
    connected_facebook?: boolean;
    connected_twitter?: boolean;
}

type RegisterError = { username: string[] } | { email: string[] } | { facebook_id: string[] } | { google_id: string[] } | { twitter_id: string[] };

export interface LoginResponse {
    data: {
        status: boolean,
        redirect_url: string,
        message?: string | string[],
        post_callback: string,
        identity?: string,
        rememberme?: boolean,
        userdata?: GrUser | false,
        errors?: RegisterError | string[] | string
    },

    callback: string
}

function phpToJson(phpStr: string): any {
    var jsonStr = phpStr.replace(/.*({.*?}).*/, '$1').replace(/([{;])s:\d+:"/g, '$1"').replace(/([{;])i:(\d+);/g, '$1$2;').replace(/([{;])N;/g, '$1null;').replace(/;(.*?);/g, ':$1,');
    if (!jsonStr) return null;
    return eval('(' + jsonStr + ')');
}

function parseUser(phpStr: string): GrUser | null {
    const user = phpToJson(phpStr);
    if (user && 'id' in user && 'login' in user && 'email' in user && 'avatar' in user && 'premium' in user && 'cc_will_expire' in user) {
        user.premium = user.premium === '1';
        user.cc_will_expire = user.cc_will_expire === '1';
        return user;
    }
    return null;
}

/*
In the future, we may want to delete the cookie ourselves instead of doing a logout server side

function deleteCookie(name: string) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
*/

export class KEventLogin extends KEvent {
    constructor(user: GrUser) {
        super();
        this.type = 'gr:login';
    }
}

export class KEventRegister extends KEvent {
    constructor(data: FormData) {
        super();
        this.type = 'gr:register';
    }
}

export function showMessage(form: HTMLElement, msgHtml: string | string[] | RegisterError, type: 'error' | 'success') {
    const messageBlock = q("p.message", form);
    if (!messageBlock) return;

    if (msgHtml instanceof Array) {
        messageBlock.innerHTML = msgHtml.join('<br>');
    }
    else if (typeof msgHtml === 'string') {
        messageBlock.innerHTML = msgHtml;
    } else {
        let err: string[] = [];
        for (const field in msgHtml) {
            err = err.concat((msgHtml as {[key: string]: string[]})[field]);
            const input = qi('input[name=' + field + ']', form);
            input.classList.add('error');
        }
        messageBlock.innerHTML = err.join('<br>');
    }

    messageBlock.classList.add(type);
    messageBlock.style.display = 'block';
}

export function hideMessage(form: HTMLElement) {
    const messageBlock = q("p.message", form);
    if (!messageBlock) return;
    messageBlock.innerHTML = '';
    messageBlock.style.display = 'none';
    messageBlock.classList.remove('error', 'success');
    for (const input of qq('input', form)) {
        input.classList.remove('error', 'success');
    }
}

export class GrSession extends KEventTarget {
    private static _instance: GrSession;
    public user: GrUser | null;

    private constructor() {
        super();
        this.init();
    }

    private init() {
        var grSessionTxt2 = decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*gr_session2\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1"));
        this.user = parseUser(grSessionTxt2);
    }    

    addEventListener(type: 'gr:login', listener: (ev: KEventLogin) => any, useCapture?: boolean): any;
    addEventListener(type: 'gr:register', listener: (ev: KEventRegister) => any, useCapture?: boolean): void;
    addEventListener(type: 'gr:logout', listener: (ev: KEvent) => any, useCapture?: boolean): void;
    addEventListener(type: 'gr:login-error', listener: (ev: KEvent) => any, useCapture?: boolean): void;
    addEventListener(type: 'gr:register-error', listener: (ev: KEvent) => any, useCapture?: boolean): void;
    addEventListener(type: 'gr:forgot-password', listener: (ev: KEvent) => any, useCapture?: boolean): void;
    addEventListener(type: 'gr:forgot-password-error', listener: (ev: KEvent) => any, useCapture?: boolean): void;
    addEventListener(type: string, listener: (ev: KEvent) => any, useCapture: boolean = true): void
    {
        super.addEventListener(type, listener, useCapture);
    }    

    triggerError(type: string) {
        return this.dispatchEvent(KEvent.fromType(`gr:${type}-error`));
    }

    triggerLogin(user: GrUser) {
        return this.dispatchEvent(new KEventLogin(user));
    }

    triggerRegister(data: FormData) {
        return this.dispatchEvent(new KEventRegister(data));
    }
    
    triggerLogout() {
        return this.dispatchEvent(KEvent.fromType('gr:logout'));
    }

    public static getInstance()
    {
        return this._instance || (this._instance = new this());
    }

    isLogged() {
        return !!this.user;
    }

    isPremium() {
        return this.user && this.user.premium;
    }

    private hookAuthForm(formName: 'login' | 'register') {
        for (const f of qq('.gr-auth__' + formName + '-form')) {
            if (!('__submitCallback' in f)) {
                (f as any)['__submitCallback'] = true;
                f.addEventListener('submit', async (ev) => {
                    ev.preventDefault();

                    let submitButton = f.querySelector('[type="submit"]');
                    let submitReload: boolean = f.dataset.reload ? ('true' === f.dataset.reload) : true;

                    if (submitButton) {
                        f.classList.add('disabled');
                        submitButton.classList.add('button--loading');
                    }

                    try {
                        let data = new FormData(ev.target as HTMLFormElement);

                        await this.loginOrRegister(formName, data).then((user) => {                            
                            hideMessage(f);
                            // if we don't get any information about the user we have to reload as we can not customize the header

                            if (!user) {
                                if ('register' === formName) {
                                    this.triggerRegister(data);
                                }

                                if (submitReload) {
                                    window.location.reload();
                                }

                                return;
                            }

                            this.user = user;
                            this.updateUI();
                            this.triggerLogin(this.user);
                        }).catch((error: string | string[] | RegisterError) => {
                            showMessage(f, error, 'error');

                            this.triggerError(formName);
                        });
                    } catch(e) {
                        console.error(e);
                    } finally {
                        if (submitButton) {
                            f.classList.remove('disabled');
                            submitButton.classList.remove('button--loading');
                        }
                    }

                });
            }
        }
    }

    updateUI() {
        var u = this.user;

        if (u) {
            /* TODO: remove these special cases in favour of generic gr_user_name, gr_user_email and gr_user_avatar */
            for (const e of qq('.gr-auth__name')) {
                e.innerHTML = u.login;
            }
            for (const e of qq('.gr-auth__email')) {
                e.innerHTML = u.email;
            }
            for (const e of qq('.gr-auth__avatar')) {
                if (!(e instanceof HTMLImageElement)) return;
                e.alt = u.login;
                e.src = u.avatar;
            }
        }

        for (const e of qq('.gr-auth')) {
            let cl = e.className.replace(/(^|\s)gr-auth--(not-)?logged($|\s)/, ' ');
            if (this.isLogged()) {
                e.className = cl + ' gr-auth--logged';
            }
            else {
                e.className = cl + ' gr-auth--not-logged';
            }

            cl = e.className.replace(/(^|\s)gr-auth--(not-)?premium($|\s)/, ' ');
            if (this.isPremium()) {
                e.className = cl + ' gr-auth--premium';
            }
            else {
                e.className = cl + ' gr-auth--not-premium';
            }
        }

        for (const e of qq('.gr-auth__logout-button')) {
            if (!('__clickToLogOut' in e)) {
                (e as any)['__clickToLogOut'] = true;
                e.addEventListener('click', (ev) => {
                    this.logout().then(() => {
                        this.user = null;
                        this.updateUI();
                        this.triggerLogout();
                    }).catch((error: string) => {
                        console.error(error);
                    });
                    ev.preventDefault();
                });
            }
        }

        this.hookPasswordForm();
        this.hookAuthForm('login');
        this.hookAuthForm('register');
    }

    updateUser() {
        var grSessionTxt2 = decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*gr_session2\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1"));
        this.user = parseUser(grSessionTxt2);
    }

    logout(): Promise<{}> {
        return new Promise((resolve, reject) => {
            var req = new XMLHttpRequest();
            req.addEventListener('load', () => {
                try {
                    if (req.status === 200) {
                        const ret: LoginResponse = JSON.parse(req.response);
                        if (!ret.data.status) {
                            resolve();
                        }
                        else {
                            reject('Failed logout: ' + ret.data.message);
                        }
                    }
                }
                catch (e) {
                    reject('Error reading response: ' + req.response);
                    throw e;
                }
            });

            req.open('DELETE', '/profile/request/login');
            req.setRequestHeader('X-Requested-With', 'xmlhttprequest');
            req.send();
        });
    }

    loginOrRegister(action: 'login' | 'register', formData: FormData): Promise<GrUser | undefined> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.addEventListener('load', () => {
                try {
                    if (req.status === 200) {
                        const ret: LoginResponse = JSON.parse(req.response);
                        if (ret.data.status) {
                            // TODO: on register ret.data.userdata does not exist
                            if (ret.data.userdata) {
                                resolve(ret.data.userdata);
                            }
                            else {
                                resolve();
                            }
                        }
                        else {
                            // TODO: on register the errors are contained in ret.data.errors
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

            // TODO: Extract this URL from the form.action
            req.open('POST', action == 'login' ? '/profile/request/login' : '/profile/request/login/register');
            req.setRequestHeader('X-Requested-With', 'xmlhttprequest');
            req.send(formData);
        }) as Promise<GrUser | undefined>;
    }

    passwordRecovery(formData: FormData) {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();

            req.addEventListener('load', () => {                
                try {
                    const ret = JSON.parse(req.response);

                    if (req.status !== 200) {
                        reject(ret.data.message || ret.data.errors);
                    }
                    
                    resolve(ret.data.message);
                }
                catch (e) {
                    console.error('Error reading response (json):', req.response);
                    reject('Error reading response (json):' + req.response);
                }
            });

            // TODO: Extract this URL from the form.action
            req.open('POST', '/profile/request/login/lost_password');
            req.setRequestHeader('X-Requested-With', 'xmlhttprequest');
            req.send(formData);
        });
    }

    private hookPasswordForm() {
        for (const f of qq('.gr-auth__forgot-password-form')) {
            if (!('__submitCallback' in f)) {
                (f as any)['__submitCallback'] = true;
                f.addEventListener('submit', async (ev) => {
                    ev.preventDefault();

                    let submitButton = f.querySelector('[type="submit"]');
                    let submitReload: boolean = f.dataset.reload ? ('true' === f.dataset.reload) : true;

                    f.classList.add('disabled');

                    if (submitButton) {
                        submitButton.classList.add('button--loading');
                    }

                    try {
                        let data = new FormData(ev.target as HTMLFormElement);

                        await this.passwordRecovery(data).then((message: string) => {
                            hideMessage(f);
                            showMessage(f, message, 'success');
                        }).catch((error: string | string[] | RegisterError) => {
                            showMessage(f, error, 'error');

                            this.triggerError('forgot-password');
                        });
                    } catch(e) {
                        console.error(e);
                    } finally {
                        f.classList.remove('disabled');

                        if (submitButton) {
                            submitButton.classList.remove('button--loading');
                        }
                    }
                });
            }
        }
    }
}

export const gr = GrSession.getInstance();
document.addEventListener('DOMContentLoaded', () => gr.updateUI());
