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
    private dummy: { [key: string]: string };

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
        const k = namespace + '/' + key;
        if (this.backend) {
            this.backend.removeItem(k);
        }
        else {
            this.dummy[k];
        }
    }

    getItem(namespace: string, key: string): string | null {
        const k = namespace + '/' + key;
        return this.backend ? this.backend.getItem(k) : this.dummy[k];
    }

    setItem(namespace: string, key: string, value: string) {
        const k = namespace + '/' + key;
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
}

export let localStorage = new ClientStorage('local');
export let sessionStorage = new ClientStorage('session');
