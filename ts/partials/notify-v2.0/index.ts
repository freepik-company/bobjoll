import { NotifyMethod } from './notifyMethod';
import Axios, { AxiosResponse } from 'axios';

export class Notify {
    private settings: NotifySettings;
    private queue: NotifyMethod[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private quechuaPromiseArr: Promise<AxiosResponse<any>[]> | undefined;

    constructor(options?: NotifyOptions) {
        this.settings = {
            history: true,
            ...options,
        };
        this.quechua();
        if (this.quechuaPromiseArr) {
            this.quechuaPromiseArr.then(() => this.publishQueue());
        }
    }

    private quechua() {
        if (this.settings.quechua) {
            this.quechuaPromiseArr = Axios.all(
                this.settings.quechua.reduce((acc: NotifyQuechuaRequest[], quechua) => {
                    const promise = Axios.get(quechua.url, { withCredentials: false });
                    promise.then(response => quechua.handler(response)).catch(err => console.error(err));
                    if (quechua.async) acc.push(promise);
                    return acc;
                }, []),
            );
        }
    }
    private async publishNextInQueue(awaitQuechua = true) {
        let isShowTrue = false;
        let notification: NotifyMethod | null = null;
        let queue = this.queue.sort((a, b) => a.getSettings().priority - b.getSettings().priority);
        let queueIndex = 0;
        if (this.quechuaPromiseArr && queue.length) {
            queue = queue.filter(notification => notification.getSettings().awaitQuechua === awaitQuechua);
        }
        while (queue && !isShowTrue && queue.length && queueIndex < queue.length) {
            isShowTrue = await queue[queueIndex].publish(queue);
            if (isShowTrue) notification = queue[queueIndex];
            queueIndex++;
        }
        return notification;
    }

    public add(notifyMethod: NotifyMethod) {
        this.queue.push(notifyMethod);
    }
    public async publishQueue() {
        let notification: NotifyMethod | null = null;
        if (this.quechuaPromiseArr) {
            notification = await this.publishNextInQueue(false);
            try {
                await this.quechuaPromiseArr;
            } catch (err) {
                console.error('Quechua failed loading:', err);
            }
        }
        if (!notification) {
            this.publishNextInQueue();
        }
    }
}

export interface NotifyBaseSettings {
    quechua?: NotifyQuechua[];
}

export interface NotifySettings extends NotifyBaseSettings {
    history: boolean;
}

export interface NotifyOptions extends NotifyBaseSettings {
    history?: boolean;
}

export interface NotifyQuechua {
    async: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (response: any) => void;
    url: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NotifyQuechuaRequest = Promise<AxiosResponse<any>>;
