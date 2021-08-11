import { q, qq } from '../library/delegate';

export default class InputRange {
    private range: HTMLInputElement;
    private rangeValue: number;

    constructor(selector: string, marks?: RangeMark[]) {

        this.range = q(selector) as HTMLInputElement;

        marks && marks.length > 0 && this.createRangeMarks(marks);

        this.range.addEventListener('input', () => {
            this.rangeValue = this.range.valueAsNumber;
            this.fillRangeColor();
            this.updateRangeMarks();
        })
    }

    private createRangeMarks = (marks?: RangeMark[]) => {
        const rangeWrapper = this.range.parent('.range--wrapper');
        const ulMarkList = document.createElement('ul');
        marks?.forEach(mark => {
            const { value, text } = mark;
            const liElement = document.createElement('li');
            liElement.dataset.value = value.toString();
            liElement.dataset.text = text;

            ulMarkList?.appendChild(liElement);
        });

        rangeWrapper?.appendChild(ulMarkList);
    }

    private fillRangeColor = () => {
        const valPercent = (this.rangeValue - parseInt(this.range.min)) / (parseInt(this.range.max) - parseInt(this.range.min));
        const style = `-webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${valPercent}, #1273EB), color-stop(${valPercent}, transparent))`;
        this.range.style.backgroundImage = style;
    }

    private updateRangeMarks = () => {
        qq('.range--marks .mark').forEach(mark => {
            const markValue = mark.dataset.value || 0;
            if (+markValue === this.rangeValue) {
                (q('.range--title') as HTMLParagraphElement).textContent = mark.dataset.text || '';
            }
    
            mark.classList[markValue <= this.rangeValue ? 'add' : 'remove']('active');
        });
    }
}

export interface RangeMark {
    value: number;
    text: string;
}