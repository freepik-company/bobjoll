import { q } from '../library/dom';

export default class ProgressBar {
    public static setValue(selector: string, value: number, completeTitleHtml?: string) {
        const progressBar = q(selector);
        if (progressBar) {
            (q('.progress-bar__value', progressBar) as HTMLElement).style.width = `${value}%`;

            if (value === 100) {
                progressBar.dataset.complete = 'true';

                if (completeTitleHtml) {

                    const progressBarTitle = q('.progress-bar__title', progressBar) as HTMLParagraphElement;

                    progressBarTitle.innerHTML = completeTitleHtml;

                    progressBarTitle.classList.add('progress-bar__title-complete');
                }

            } else {
                progressBar.dataset.complete = 'false';
            }
        }
    }
}
