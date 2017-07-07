export function q(selector: string, parent: HTMLElement | Document = document): HTMLElement | null {
	const x = parent.querySelector(selector);
	return x ? x as HTMLElement : x;
}

export function qq(selector: string, parent: HTMLElement | Document = document): HTMLElement[] {
	return Array.prototype.slice.call(parent.querySelectorAll(selector), 0);
}

export function qi(selector: string, parent: HTMLElement | Document = document): HTMLInputElement {
	return q(selector, parent) as HTMLInputElement;
}
