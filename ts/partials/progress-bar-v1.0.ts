import { q } from '../library/dom';

export class ProgressBar {
    public static setProgressValue(progressBarSelector: string, progressValue: number) {
        const progressBar = q(progressBarSelector);
        if (progressBar) {
            (q('.progress-bar__value', progressBar) as HTMLElement).style.width = `${progressValue}%`;

            if (progressValue === 100) {
                progressBar.dataset.complete = 'true';
            }
        }
    }

    public static resetProgressBar(progressBarSelector: string) {
        this.setProgressValue(progressBarSelector, 0);
    }

    public static completeProgressBar(progressBarSelector: string) {
        this.setProgressValue(progressBarSelector, 100);
    }
}