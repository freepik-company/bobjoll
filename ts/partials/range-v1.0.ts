import { q, qq } from '../library/dom';

export default class Range {
    private rangeWrapper: HTMLDivElement;
    private range: HTMLInputElement;
    private rangeValue: number;

    constructor(options: RangeOptions) {
        const { selector, marks, callback } = options
        this.rangeWrapper = q(selector) as HTMLDivElement;
        this.range = q('.range', this.rangeWrapper) as HTMLInputElement;

        marks && marks.length > 0 && this.initializeDynamicRange(options);
        this.updateRange();
        this.range.addEventListener('input', () => {
            this.updateRange();
        });
        if (callback) {
            this.range.addEventListener('change', () => {
                callback(this.range.valueAsNumber);
            });
        }
    }

    public updateRange = (updateValue?: number) => {
        if (updateValue !== undefined && updateValue !== this.range.valueAsNumber) {
            this.range.value = `${updateValue}`;
        }
        this.rangeValue = updateValue !== undefined ? updateValue : this.range.valueAsNumber;
        this.fillRangeColor();
        this.updateRangeMarks();
    }

    private createRangeMarks = (marks: RangeMark[]) => {
        const marksElements = marks.map(this.getMarkElement);

        const ulMarkList = document.createElement('ul');
        ulMarkList.classList.add('range--marks');
        marksElements && ulMarkList.append(...marksElements);

        this.rangeWrapper.appendChild(ulMarkList);
    }

    private initializeDynamicRange = (options: RangeOptions) => {
        const { marks, withSteps } = options;

        if (marks) {
            const marksValues = marks.map(mark => mark.value);

            const minValue = Math.min(...marksValues);
            const maxValue = Math.max(...marksValues);

            this.range.min = minValue.toString();
            this.range.max = maxValue.toString();

            if (withSteps) {
                const step = maxValue / marks.length;
                this.range.step = step.toString();
            }

            marks.length > 0 && this.createRangeMarks(marks);
        }
    }

    private getMarkElement = (mark: RangeMark) => {
        const { value, text } = mark;
        const liElement = document.createElement('li');
        liElement.dataset.value = value.toString();
        liElement.dataset.text = text;
        liElement.classList.add('mark');

        return liElement;
    }

    private fillRangeColor = () => {
        const valPercent = (this.rangeValue - parseInt(this.range.min)) / (parseInt(this.range.max) - parseInt(this.range.min));
        const style = `-webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${valPercent}, #1273EB), color-stop(${valPercent}, transparent))`;
        this.range.style.backgroundImage = style;
    }

    private updateRangeMarks = () => {
        qq('.range--marks .mark', this.rangeWrapper).forEach(mark => {
            const markValue = mark.dataset.value || 0;
            if (+markValue === this.rangeValue) {
                (q('.range--title', this.rangeWrapper) as HTMLParagraphElement).textContent = mark.dataset.text || '';
            }

            mark.classList[markValue <= this.rangeValue ? 'add' : 'remove']('active');
        });
    }
}

export interface RangeOptions {
    callback?: Function;
    selector: string;
    marks?: RangeMark[];
    withSteps?: boolean;
}

export interface RangeMark {
    value: number;
    text: string;
}
