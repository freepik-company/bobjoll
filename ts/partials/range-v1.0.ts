import { q, qq } from '../library/dom';

export default class Range {
    private rangeWrapper: HTMLDivElement;
    private range: HTMLInputElement;
    private rangeValue: number;

    constructor(selector: string, options?: RangeOptions) {
        this.rangeWrapper = q(selector) as HTMLDivElement;
        this.range = q('.range', this.rangeWrapper) as HTMLInputElement;

        options && this.initializeDynamicRange(options);
        this.updateRange();
        this.range.addEventListener('input', () => {
            this.updateRange();
        });
    }

    private updateRange = () => {
        this.rangeValue = this.range.valueAsNumber;
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

        const marksValues = marks.map(mark => mark.value);

        const minValue = Math.min(...marksValues);
        const maxValue = Math.max(...marksValues);

        this.range.min = minValue.toString();
        this.range.max = maxValue.toString();

        if (withSteps) {
            const step = maxValue / marks.length;
            this.range.step = step.toString();
        }

        marks && marks.length > 0 && this.createRangeMarks(marks);
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
    marks: RangeMark[];
    withSteps: boolean;
}

export interface RangeMark {
    value: number;
    text: string;
}
