interface Element {
	parents(selector?: string): Element[];
}

Element.prototype.parents = function(this: Element, selector?: string): Element[] {
	var elements: Element[] = [];
	var elem: Element | null = this;

	if (elem && elem.parentElement) {
		while ((elem = elem.parentElement) !== null) {
			if (elem.nodeType !== Node.ELEMENT_NODE) {
				continue;
			}
	 
			if (selector && elem.matches(selector)) {
				elements.push(elem);
			}
		}
	}

	return elements;
};