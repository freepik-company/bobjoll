class Loader {
	private current: number;
	private loader: HTMLElement;
    private interval: number;
    readonly total = 100;

    constructor() {
		const loader: HTMLElement | null = document.getElementById('page-loader');
        if (loader) {
            this.loader = loader;
        }
        else {
			const loader = document.createElement('div');
			loader.id = 'page-loader';
			loader.classList.add('page-loader');				
            this.loader = loader;
        }

        if (document.body) {
            document.body.insertBefore(this.loader, document.body.firstChild);
        }
        else {
            document.addEventListener('DOMContentLoaded', () => document.body.insertBefore(this.loader, document.body.firstChild));
        }

		this.reset();
    }

    // set position between 0 and 100
	set position(percent: number) {
		this.current = percent;
		this.loader.style.width = this.current + '%';

		if (this.current >= this.total) {
			this.loader.classList.add('animation--fade-out');
		}
        else {
			this.loader.classList.remove('animation--fade-out');
        }
	}

    get position() {
        return this.current;
    }

	reset() {
        if (this.interval) {
            window.clearInterval(this.interval);
        }
        this.position = 0;
	}

    start() {
        let ticks = 0;
        this.reset();
        this.interval = window.setInterval(() => {
            if (ticks++ < 3) return;
            loader.position += (loader.total - loader.position) / 16;
        }, 100);
    }

    finish() {
        if (loader.position > 0) loader.position = 100;
        if (this.interval) {
            window.clearInterval(this.interval);
        }
    }
}

export const loader = new Loader();