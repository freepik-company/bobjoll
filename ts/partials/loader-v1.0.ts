class Loader {
    private current: number = 0;
    private loader: HTMLElement;
    private interval: number = 0;
    // tslint:disable-next-line:member-ordering
    public readonly total = 100;

    public constructor() {
        const ld: HTMLElement | null = document.getElementById('page-loader');
        if (ld) {
            this.loader = ld;
        } else {
            this.loader = document.createElement('div');
            this.loader.id = 'page-loader';
            this.loader.classList.add('page-loader');
        }

        if (document.body) {
            document.body.insertBefore(this.loader, document.body.firstChild);
        } else {
            document.addEventListener('DOMContentLoaded', () => document.body.insertBefore(
                this.loader, document.body.firstChild));
        }

        this.reset();
    }

    // set position between 0 and 100
    public set position(percent: number) {
        this.current = percent;
        this.loader.style.width = this.current + '%';

        if (this.current >= this.total) {
            this.loader.classList.add('animation--fade-out');
        } else {
            this.loader.classList.remove('animation--fade-out');
        }
    }

    public get position() {
        return this.current;
    }

    public reset() {
        if (this.interval) {
            window.clearInterval(this.interval);
        }
        this.position = 0;
    }

    public start() {
        let ticks = 0;
        this.reset();
        this.interval = window.setInterval(() => {
            if (ticks++ < 3) {
                return;
            }
            loader.position += (loader.total - loader.position) / 16;
        }, 100);
    }

    public finish() {
        if (loader.position > 0) {
            loader.position = 100;
        }
        if (this.interval) {
            window.clearInterval(this.interval);
        }
    }
}
// tslint:disable-next-line:export-name
export const loader = new Loader();
