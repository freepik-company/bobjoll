export class Preload {
    private uriList: string[];
    private items: (HTMLLinkElement | HTMLScriptElement | HTMLImageElement)[] = [];

    constructor(uriList: string[]) {
        this.uriList = uriList;
    }

    private css(url: string): PreloadPromise {
        return new Promise(resolve => {
            const style = document.createElement('link');
            style.onload = () => resolve(true);
            style.onerror = style.onabort = () => resolve(false);
            style.href = url;
            document.body.insertAdjacentElement('beforeend', style);
            this.items.push(style);
        });
    }
    private js(url: string): PreloadPromise {
        return new Promise(resolve => {
            const script = document.createElement('script');
            script.onload = () => resolve(true);
            script.onerror = script.onabort = () => resolve(false);
            script.src = url;
            document.body.insertAdjacentElement('beforeend', script);
            this.items.push(script);
        });
    }
    private img(url: string): PreloadPromise {
        return new Promise(resolve => {
            const image = document.createElement('img');
            image.onload = () => resolve(true);
            image.onerror = image.onabort = () => resolve(false);
            image.src = url;
        });
    }
    private getMethodType(url: string): Promise<boolean> | void {
        const fileExt = (url.split('.').pop() || undefined) as PreloadType;
        if (fileExt) {
            if (!fileExt.match(/css|js/gi)) {
                return this.img(url);
            }
            if (fileExt.match(/css/gi)) {
                return this.css(url);
            }
            if (fileExt.match(/js/gi)) {
                return this.js(url);
            }
        }
    }

    public await() {
        return new Promise((resolve, reject) => {
            Promise.all(
                this.uriList.reduce((acc: PreloadPromise[], url: string) => {
                    const methodPromise = this.getMethodType(url);
                    if (methodPromise) {
                        acc.push(methodPromise);
                    }
                    return acc;
                }, []),
            )
                .then(boolArr => (boolArr.indexOf(false) >= 0 ? reject() : resolve()))
                .catch(error => reject(error));
        });
    }
    public destroy() {
        this.items.forEach(item => {
            if (item.parentElement) {
                item.parentElement.removeChild(item);
            }
        });
    }
}

export type PreloadType = 'img' | 'css' | 'js' | undefined;
export type PreloadPromise = Promise<boolean>;
