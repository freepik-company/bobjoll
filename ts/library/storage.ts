function getStorage(storageType: string): Storage | null {
    try {
        var storage = (window as any)[storageType + 'Storage'],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return storage;
    }
    catch(e) {
        return null;
    }
}

export class ClientStorage
{
    private backend: Storage | null;
    private dummy: { [key: string]: string } = {};

    constructor(storageType: 'local' | 'session') {
        this.backend = getStorage(storageType);
        if (!this.backend) {
            this.dummy = {};
        }
    }

    supported(): boolean {
        return !!this.backend;
    }

    removeItem(namespace: string, key: string) {
        const k = namespace !== '' ? `${namespace}/${key}` : key;
        if (this.backend) {
            this.backend.removeItem(k);
        }
        else {
            this.dummy[k];
        }
    }

    getAll(namespace: string): {key: string; value: any}[] {
        let namespaceStored: {key: string; value: any}[] = [];

        if (this.backend) {
            for (let i = 0; i < this.backend.length; i++) {
                let key = this.backend.key(i);

                if (key && key.match(/namespace/i)) {
                    let value = this.get(namespace, key);

                    if (value) {
                        namespaceStored.push({key: key, value: value});
                    }
                }
            }
        }

        return namespaceStored;
    }

    getAllKeys(namespace: string): string[] {
        let namespaceKeys: string[] = [];

        if (this.backend) {
            for (let i = 0; i < this.backend.length; i++) {
                let key = this.backend.key(i);

                if (key && key.match(new RegExp(namespace, 'i'))) {
                    namespaceKeys.push(key);
                }
            }
        }

        return namespaceKeys;
    }

    getItem(namespace: string, key: string): string | null {
        const k = namespace !== '' ? `${namespace}/${key}` : key;
        return this.backend ? this.backend.getItem(k) : this.dummy[k];
    }

    setItem(namespace: string, key: string, value: string) {
        const k = namespace !== '' ? `${namespace}/${key}` : key;
        if (this.backend) {
            this.backend.setItem(k, value);
        }
        else {
            this.dummy[k] = value;
        }
    }

    remove(namespace: string, key: string): any | null {
        this.removeItem(namespace, key);
    }

    get(namespace: string, key: string): any | null {
        return JSON.parse(this.getItem(namespace, key) || 'null');
    }

    set(namespace: string, key: string, value: any) {
        this.setItem(namespace, key, JSON.stringify(value));
    }

    all(namespace: string) {
        return this.getAll(namespace);
    }

    keys(namespace: string) {
        return this.getAllKeys(namespace);
    }

    expired(namespace: string, key: string, expire?: Date) {
        const item = this.getItem(namespace, key);
        const now = new Date();

        if (!item || now.getTime() > parseInt(item)) {
            if (!expire) {
                expire = new Date();
                expire.setDate(expire.getDate() + 1);
                expire.setHours(0,0,0,0);
            }

            this.setItem(namespace, key, JSON.stringify(expire.getTime()));
            return true;
        } else {
            return false;
        }
    }
}

export let localStorage = new ClientStorage('local');
export let sessionStorage = new ClientStorage('session');
