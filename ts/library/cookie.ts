export class Cookie {
    public static setItem(name: string, value: string, options?: CookieOptions) {
        let cookieSettings: CookieSettings = { 
            expires: new Date(new Date().getTime() + (24 * 60 * 60 * 1000 * 365)),
            path: '/',
            ...options 
        };
        let cookieString = `${name}=${value};path=${cookieSettings.path}`;

        if (cookieSettings.domain) {
            cookieString += `;domain=${cookieSettings.domain}`;
        }

        cookieString += `;expires=${cookieSettings.expires.toUTCString()}`;

        document.cookie = cookieString;
    }

    public static getItem(name: string) {
        let c = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return c ? c[2] : null;
    }

    public static removeItem(name: string) {
        Cookie.setItem(name, '', {
            expires: new Date(),
        });
    }
}

interface CookieOptions {
    expires?: Date;
    path?: string;
    domain?: string;
}

interface CookieSettings {
    expires: Date;
    path: string;
    domain?: string;
}